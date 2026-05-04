package com.hatirlat.backend.service;

import com.hatirlat.backend.entity.Member;
import com.hatirlat.backend.exception.ResourceNotFoundException;
import com.hatirlat.backend.repository.GroupMemberRepository;
import com.hatirlat.backend.repository.MemberRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Handles self-service unsubscribe via tokenized links sent in notification footers.
 * The token is opaque, per-member, and unique. Anyone with the link can unsubscribe
 * that specific member — same trust model as classic email unsubscribe links.
 */
@Service
public class UnsubscribeService {

    private static final Logger logger = LoggerFactory.getLogger(UnsubscribeService.class);

    private final MemberRepository memberRepository;
    private final GroupMemberRepository groupMemberRepository;

    public UnsubscribeService(MemberRepository memberRepository, GroupMemberRepository groupMemberRepository) {
        this.memberRepository = memberRepository;
        this.groupMemberRepository = groupMemberRepository;
    }

    @Transactional(readOnly = true)
    public Member findByToken(String token) {
        return memberRepository.findByUnsubscribeToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Unsubscribe token", token));
    }

    /** Mark the member as unsubscribed and remove all their group memberships. */
    @Transactional
    public Member unsubscribe(String token) {
        Member member = findByToken(token);
        if (member.getUnsubscribedAt() != null) {
            return member; // already unsubscribed; idempotent
        }
        member.setUnsubscribedAt(LocalDateTime.now());
        memberRepository.save(member);
        // Detach from all groups so they no longer receive notifications
        groupMemberRepository.findByMemberId(member.getId())
                .forEach(gm -> groupMemberRepository.delete(gm));
        logger.info("Member id={} unsubscribed via token", member.getId());
        return member;
    }
}
