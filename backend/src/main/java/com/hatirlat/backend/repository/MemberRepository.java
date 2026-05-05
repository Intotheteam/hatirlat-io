package com.hatirlat.backend.repository;

import com.hatirlat.backend.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    @Query("SELECT m FROM Member m WHERE m.id IN (SELECT gm.memberId FROM GroupMember gm WHERE gm.groupId = :groupId)")
    List<Member> findMembersByGroupId(Long groupId);

    Optional<Member> findByUnsubscribeToken(String unsubscribeToken);
}