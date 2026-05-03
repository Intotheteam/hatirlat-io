package com.hatirlat.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "integration_logs", indexes = {
    @Index(name = "idx_ilog_provider", columnList = "provider"),
    @Index(name = "idx_ilog_created", columnList = "createdAt"),
    @Index(name = "idx_ilog_user", columnList = "userId")
})
public class IntegrationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private IntegrationProvider provider;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationChannel channel;

    @Column(nullable = false, length = 20)
    private String status; // SUCCESS, FAILED, DISABLED

    @Column(precision = 12, scale = 6)
    private BigDecimal costAmount;

    @Column(length = 5)
    private String costCurrency; // TRY, USD

    private Long userId;
    private Long reminderId;

    @Column(length = 50)
    private String recipientMasked;

    @Column(length = 50)
    private String errorCode;

    @Column(length = 1000)
    private String errorMessage;

    private Long durationMs;

    @Column(length = 100)
    private String providerMessageId;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // getters & setters for all fields
    public Long getId() { return id; }
    public IntegrationProvider getProvider() { return provider; }
    public void setProvider(IntegrationProvider provider) { this.provider = provider; }
    public NotificationChannel getChannel() { return channel; }
    public void setChannel(NotificationChannel channel) { this.channel = channel; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getCostAmount() { return costAmount; }
    public void setCostAmount(BigDecimal costAmount) { this.costAmount = costAmount; }
    public String getCostCurrency() { return costCurrency; }
    public void setCostCurrency(String costCurrency) { this.costCurrency = costCurrency; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getReminderId() { return reminderId; }
    public void setReminderId(Long reminderId) { this.reminderId = reminderId; }
    public String getRecipientMasked() { return recipientMasked; }
    public void setRecipientMasked(String recipientMasked) { this.recipientMasked = recipientMasked; }
    public String getErrorCode() { return errorCode; }
    public void setErrorCode(String errorCode) { this.errorCode = errorCode; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public Long getDurationMs() { return durationMs; }
    public void setDurationMs(Long durationMs) { this.durationMs = durationMs; }
    public String getProviderMessageId() { return providerMessageId; }
    public void setProviderMessageId(String providerMessageId) { this.providerMessageId = providerMessageId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
