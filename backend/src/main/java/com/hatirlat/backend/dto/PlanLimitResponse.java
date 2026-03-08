package com.hatirlat.backend.dto;

import com.hatirlat.backend.entity.PlanLimitKey;
import java.time.LocalDateTime;

public class PlanLimitResponse {
    private Long id;
    private PlanLimitKey limitKey;
    private int intValue;
    private boolean boolValue;
    private String description;
    private LocalDateTime updatedAt;

    public PlanLimitResponse() {
    }

    public PlanLimitResponse(Long id, PlanLimitKey limitKey, int intValue, boolean boolValue,
            String description, LocalDateTime updatedAt) {
        this.id = id;
        this.limitKey = limitKey;
        this.intValue = intValue;
        this.boolValue = boolValue;
        this.description = description;
        this.updatedAt = updatedAt;
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

    public void setId(Long id) {
        this.id = id;
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
