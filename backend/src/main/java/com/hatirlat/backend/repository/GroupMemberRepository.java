package com.hatirlat.backend.repository;

import com.hatirlat.backend.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    
    @Query("SELECT gm FROM GroupMember gm WHERE gm.groupId = :groupId AND gm.memberId = :memberId")
    GroupMember findByGroupIdAndMemberId(Long groupId, Long memberId);
    
    @Query("SELECT gm FROM GroupMember gm WHERE gm.groupId = :groupId")
    List<GroupMember> findByGroupId(Long groupId);
    
    void deleteByGroupIdAndMemberId(Long groupId, Long memberId);
}