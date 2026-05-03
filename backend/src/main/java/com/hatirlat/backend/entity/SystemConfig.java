package com.hatirlat.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * System configuration entity for storing application settings,
 * API keys, feature flags, and other dynamic configurations.
 *
 * Sensitive data (API keys) are stored encrypted.
 */
@Entity
@Table(name = "system_config")
public class SystemConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Unique key for the configuration
     * Examples: "twilio.account_sid", "feature.whatsapp.enabled", "free.daily_limit"
     */
    @Column(name = "config_key", unique = true, nullable = false, length = 255)
    private String configKey;

    /**
     * Configuration value (encrypted if sensitive)
     */
    @Column(name = "config_value", columnDefinition = "TEXT")
    private String configValue;

    /**
     * Type of configuration
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConfigType type;

    /**
     * Whether this value is encrypted in the database
     */
    @Column(nullable = false)
    private boolean encrypted = false;

    /**
     * Whether this configuration is currently active
     */
    @Column(nullable = false)
    private boolean active = true;

    /**
     * Human-readable description of what this config does
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * When this config was created
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * When this config was last updated
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public SystemConfig() {
    }

    public SystemConfig(String configKey, String configValue, ConfigType type) {
        this.configKey = configKey;
        this.configValue = configValue;
        this.type = type;
    }

    public SystemConfig(String configKey, String configValue, ConfigType type, boolean encrypted) {
        this.configKey = configKey;
        this.configValue = configValue;
        this.type = type;
        this.encrypted = encrypted;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getConfigKey() {
        return configKey;
    }

    public void setConfigKey(String configKey) {
        this.configKey = configKey;
    }

    public String getConfigValue() {
        return configValue;
    }

    public void setConfigValue(String configValue) {
        this.configValue = configValue;
    }

    public ConfigType getType() {
        return type;
    }

    public void setType(ConfigType type) {
        this.type = type;
    }

    public boolean isEncrypted() {
        return encrypted;
    }

    public void setEncrypted(boolean encrypted) {
        this.encrypted = encrypted;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
