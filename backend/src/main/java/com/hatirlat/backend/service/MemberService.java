package com.hatirlat.backend.service;

import com.hatirlat.backend.dto.MemberRequest;
import com.hatirlat.backend.dto.MemberResponse;
import com.hatirlat.backend.entity.Group;
import com.hatirlat.backend.entity.Member;
import com.hatirlat.backend.entity.MemberRole;
import com.hatirlat.backend.entity.MemberStatus;
import com.hatirlat.backend.repository.GroupRepository;
import com.hatirlat.backend.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MemberService {

    @Autowired
    private MemberRepository memberRepository;
    
    @Autowired
    private GroupRepository groupRepository;

    public List<MemberResponse> getGroupMembers(String groupId) {
        Group group = groupRepository.findById(Long.parseLong(groupId)).orElse(null);
        if (group != null && group.getMembers() != null) {
            return group.getMembers().stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());
        }
        return List.of();
    }

    public MemberResponse addMemberToGroup(String groupId, MemberRequest request) {
        Group group = groupRepository.findById(Long.parseLong(groupId)).orElse(null);
        if (group == null) {
            return null;
        }

        Member member = new Member();
        member.setName(request.getName());
        member.setEmail(request.getEmail());
        member.setPhone(request.getPhone());
        member.setRole(request.getRole() != null ? MemberRole.valueOf(request.getRole().toUpperCase()) : MemberRole.MEMBER);
        member.setStatus(MemberStatus.PENDING); // New members start as pending

        Member savedMember = memberRepository.save(member);

        // Add member to group
        group.getMembers().add(savedMember);
        groupRepository.save(group);

        return convertToResponse(savedMember);
    }

    public boolean removeMemberFromGroup(String groupId, String memberId) {
        Group group = groupRepository.findById(Long.parseLong(groupId)).orElse(null);
        if (group == null) {
            return false;
        }

        Member member = memberRepository.findById(Long.parseLong(memberId)).orElse(null);
        if (member == null) {
            return false;
        }

        boolean removed = group.getMembers().remove(member);
        if (removed) {
            groupRepository.save(group);
        }
        return removed;
    }

    public String inviteMember(String email, String groupId) {
        // In a real implementation, you would send an email invitation
        // For now, we'll just return a message
        return "Invitation sent to " + email + " for group " + groupId;
    }

    private MemberResponse convertToResponse(Member member) {
        MemberResponse response = new MemberResponse();
        response.setId(String.valueOf(member.getId()));
        response.setName(member.getName());
        response.setEmail(member.getEmail());
        response.setRole(member.getRole() != null ? member.getRole().name().toLowerCase() : null);
        response.setStatus(member.getStatus() != null ? member.getStatus().name().toLowerCase() : null);
        response.setJoinedAt(member.getJoinedAt());
        response.setPhone(member.getPhone());
        response.setLastActivity(member.getLastActivity());
        return response;
    }
}