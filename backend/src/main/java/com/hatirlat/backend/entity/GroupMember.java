package com.hatirlat.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "group_members")
public class GroupMember {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "group_id")
    private Long groupId;
    
    @Column(name = "member_id")
    private Long memberId;

    // Constructors
    public GroupMember() {}
    
    public GroupMember(Long groupId, Long memberId) {
        this.groupId = groupId;
        this.memberId = memberId;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public Long getMemberId() {
        return memberId;
    }

    public void setMemberId(Long memberId) {
        this.memberId = memberId;
    }
}