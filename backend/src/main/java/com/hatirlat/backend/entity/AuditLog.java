package com.hatirlat.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Audit log entity for tracking admin actions and system events.
 * Records who did what, when, and to which entity.
 */
@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_admin_id", columnList = "admin_id"),
    @Index(name = "idx_timestamp", columnList = "timestamp"),
    @Index(name = "idx_action", columnList = "action"),
    @Index(name = "idx_target", columnList = "target_entity,target_id")
})
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The admin user who performed the action
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private User admin;

    /**
     * Action performed
     * Examples: "USER_BANNED", "USER_UNBANNED", "CONFIG_UPDATED",
     *           "FEATURE_TOGGLED", "GROUP_DELETED", "ROLE_CHANGED"
     */
    @Column(nullable = false, length = 100)
    private String action;

    /**
     * Type of entity affected
     * Examples: "User", "SystemConfig", "Group", "Reminder"
     */
    @Column(name = "target_entity", length = 50)
    private String targetEntity;

    /**
     * ID of the affected entity
     */
    @Column(name = "target_id")
    private Long targetId;

    /**
     * Detailed information about the change (JSON format)
     * Example: {"old_value": "false", "new_value": "true", "field": "enabled"}
     */
    @Column(columnDefinition = "TEXT")
    private String details;

    /**
     * IP address from which the action was performed
     */
    @Column(name = "ip_address", length = 45) // IPv6 support
    private String ipAddress;

    /**
     * User agent of the client
     */
    @Column(name = "user_agent", length = 255)
    private String userAgent;

    /**
     * When the action was performed
     */
    @Column(nullable = false)
    private LocalDateTime timestamp;

    // Lifecycle callback
    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    // Constructors
    public AuditLog() {
    }

    public AuditLog(User admin, String action, String targetEntity, Long targetId) {
        this.admin = admin;
        this.action = action;
        this.targetEntity = targetEntity;
        this.targetId = targetId;
        this.timestamp = LocalDateTime.now();
    }

    // Builder pattern for easier construction
    public static class Builder {
        private final AuditLog auditLog = new AuditLog();

        public Builder admin(User admin) {
            auditLog.admin = admin;
            return this;
        }

        public Builder action(String action) {
            auditLog.action = action;
            return this;
        }

        public Builder target(String entity, Long id) {
            auditLog.targetEntity = entity;
            auditLog.targetId = id;
            return this;
        }

        public Builder details(String details) {
            auditLog.details = details;
            return this;
        }

        public Builder ipAddress(String ipAddress) {
            auditLog.ipAddress = ipAddress;
            return this;
        }

        public Builder userAgent(String userAgent) {
            auditLog.userAgent = userAgent;
            return this;
        }

        public AuditLog build() {
            auditLog.timestamp = LocalDateTime.now();
            return auditLog;
        }
    }

    public static Builder builder() {
        return new Builder();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getAdmin() {
        return admin;
    }

    public void setAdmin(User admin) {
        this.admin = admin;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getTargetEntity() {
        return targetEntity;
    }

    public void setTargetEntity(String targetEntity) {
        this.targetEntity = targetEntity;
    }

    public Long getTargetId() {
        return targetId;
    }

    public void setTargetId(Long targetId) {
        this.targetId = targetId;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
