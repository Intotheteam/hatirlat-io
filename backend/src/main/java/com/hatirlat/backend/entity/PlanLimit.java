package com.hatirlat.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Stores configurable plan limits in the database.
 * Each row represents one named limit (FREE_MAX_GROUPS,
 * PREMIUM_MAX_MEMBERS_PER_GROUP, etc.)
 * with an integer value and a boolean flag for on/off rules.
 */
@Entity
@Table(name = "plan_limits")
public class PlanLimit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "limit_key", nullable = false, unique = true, length = 64)
    private PlanLimitKey limitKey;

    /** Numeric limit value (e.g. 3 for max groups). Use -1 for unlimited. */
    @Column(name = "int_value", nullable = false)
    private int intValue;

    /**
     * Boolean flag (e.g. hourly_allowed = true/false). Derived from intValue:
     * 1=true, 0=false
     */
    @Column(name = "bool_value", nullable = false)
    private boolean boolValue;

    @Column(name = "description", length = 256)
    private String description;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public PlanLimit() {
    }

    public PlanLimit(PlanLimitKey limitKey, int intValue, boolean boolValue, String description) {
        this.limitKey = limitKey;
        this.intValue = intValue;
        this.boolValue = boolValue;
        this.description = description;
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    @PrePersist
    public void touch() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public PlanLimitKey getLimitKey() {
        return limitKey;
    }

    public int getIntValue() {
        return intValue;
    }

    public boolean isBoolValue() {
        return boolValue;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setLimitKey(PlanLimitKey limitKey) {
        this.limitKey = limitKey;
    }

    public void setIntValue(int intValue) {
        this.intValue = intValue;
    }

    public void setBoolValue(boolean boolValue) {
        this.boolValue = boolValue;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
