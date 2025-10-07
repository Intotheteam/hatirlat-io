package com.hatirlat.backend.repository;

import com.hatirlat.backend.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    
    @Query("SELECT m FROM Member m JOIN GroupMember gm ON m.id = gm.memberId WHERE gm.groupId = :groupId")
    List<Member> findMembersByGroupId(Long groupId);
}