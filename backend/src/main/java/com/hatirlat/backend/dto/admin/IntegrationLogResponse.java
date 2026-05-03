package com.hatirlat.backend.dto.admin;

import com.hatirlat.backend.entity.IntegrationLog;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

public class IntegrationLogResponse {
    private Long id;
    private String provider;
    private String channel;
    private String status;
    private BigDecimal costAmount;
    private String costCurrency;
    private Long userId;
    private Long reminderId;
    private String recipientMasked;
    private String errorCode;
    private String errorMessage;
    private Long durationMs;
    private String providerMessageId;
    private String createdAt;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public static IntegrationLogResponse fromEntity(IntegrationLog e) {
        IntegrationLogResponse r = new IntegrationLogResponse();
        r.id = e.getId();
        r.provider = e.getProvider() != null ? e.getProvider().name() : null;
        r.channel = e.getChannel() != null ? e.getChannel().name() : null;
        r.status = e.getStatus();
        r.costAmount = e.getCostAmount();
        r.costCurrency = e.getCostCurrency();
        r.userId = e.getUserId();
        r.reminderId = e.getReminderId();
        r.recipientMasked = e.getRecipientMasked();
        r.errorCode = e.getErrorCode();
        r.errorMessage = e.getErrorMessage();
        r.durationMs = e.getDurationMs();
        r.providerMessageId = e.getProviderMessageId();
        r.createdAt = e.getCreatedAt() != null ? e.getCreatedAt().format(FMT) : null;
        return r;
    }

    // All getters
    public Long getId() { return id; }
    public String getProvider() { return provider; }
    public String getChannel() { return channel; }
    public String getStatus() { return status; }
    public BigDecimal getCostAmount() { return costAmount; }
    public String getCostCurrency() { return costCurrency; }
    public Long getUserId() { return userId; }
    public Long getReminderId() { return reminderId; }
    public String getRecipientMasked() { return recipientMasked; }
    public String getErrorCode() { return errorCode; }
    public String getErrorMessage() { return errorMessage; }
    public Long getDurationMs() { return durationMs; }
    public String getProviderMessageId() { return providerMessageId; }
    public String getCreatedAt() { return createdAt; }
}
