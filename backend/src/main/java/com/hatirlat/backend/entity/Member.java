package com.hatirlat.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "members")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    
    @Enumerated(EnumType.STRING)
    private MemberRole role; // Enum for "Admin" or "Member"
    
    @Enumerated(EnumType.STRING)
    private MemberStatus status; // Enum for "Active" or "Pending"
    
    private LocalDateTime joinedAt;
    private String phone;
    private LocalDateTime lastActivity;

    // Constructors
    public Member() {
        this.joinedAt = LocalDateTime.now();
        this.status = MemberStatus.PENDING; // Default to pending
    }

    public Member(String name, String email, String phone) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.joinedAt = LocalDateTime.now();
        this.role = MemberRole.MEMBER; // Default role
        this.status = MemberStatus.PENDING; // Default to pending
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public MemberRole getRole() {
        return role;
    }

    public void setRole(MemberRole role) {
        this.role = role;
    }

    public MemberStatus getStatus() {
        return status;
    }

    public void setStatus(MemberStatus status) {
        this.status = status;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public LocalDateTime getLastActivity() {
        return lastActivity;
    }

    public void setLastActivity(LocalDateTime lastActivity) {
        this.lastActivity = lastActivity;
    }
}