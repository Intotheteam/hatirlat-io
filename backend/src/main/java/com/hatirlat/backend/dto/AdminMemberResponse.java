package com.hatirlat.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.List;

public class AdminMemberResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String status;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime joinedAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastActivity;

    // Groups this member belongs to
    private List<GroupInfo> groups;

    public static class GroupInfo {
        private Long id;
        private String name;
        private String ownerUsername;
        private long memberCount;

        public GroupInfo() {}
        public GroupInfo(Long id, String name, String ownerUsername, long memberCount) {
            this.id = id;
            this.name = name;
            this.ownerUsername = ownerUsername;
            this.memberCount = memberCount;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getOwnerUsername() { return ownerUsername; }
        public void setOwnerUsername(String ownerUsername) { this.ownerUsername = ownerUsername; }
        public long getMemberCount() { return memberCount; }
        public void setMemberCount(long memberCount) { this.memberCount = memberCount; }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }

    public LocalDateTime getLastActivity() { return lastActivity; }
    public void setLastActivity(LocalDateTime lastActivity) { this.lastActivity = lastActivity; }

    public List<GroupInfo> getGroups() { return groups; }
    public void setGroups(List<GroupInfo> groups) { this.groups = groups; }
}
