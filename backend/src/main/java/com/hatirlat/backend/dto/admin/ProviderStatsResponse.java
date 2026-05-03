package com.hatirlat.backend.dto.admin;

import java.math.BigDecimal;

public class ProviderStatsResponse {
    private String provider;
    private String displayName;
    private String channel;
    private long totalRequests;
    private long successCount;
    private long failedCount;
    private long disabledCount;
    private double successRate; // 0-100
    private BigDecimal totalCost;
    private String currency;
    private Double avgDurationMs;

    // No-arg constructor
    public ProviderStatsResponse() {}

    // getters & setters
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }
    public long getTotalRequests() { return totalRequests; }
    public void setTotalRequests(long totalRequests) { this.totalRequests = totalRequests; }
    public long getSuccessCount() { return successCount; }
    public void setSuccessCount(long successCount) { this.successCount = successCount; }
    public long getFailedCount() { return failedCount; }
    public void setFailedCount(long failedCount) { this.failedCount = failedCount; }
    public long getDisabledCount() { return disabledCount; }
    public void setDisabledCount(long disabledCount) { this.disabledCount = disabledCount; }
    public double getSuccessRate() { return successRate; }
    public void setSuccessRate(double successRate) { this.successRate = successRate; }
    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public Double getAvgDurationMs() { return avgDurationMs; }
    public void setAvgDurationMs(Double avgDurationMs) { this.avgDurationMs = avgDurationMs; }
}
