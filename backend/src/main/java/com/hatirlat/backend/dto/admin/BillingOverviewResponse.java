package com.hatirlat.backend.dto.admin;

import java.math.BigDecimal;
import java.util.List;

public class BillingOverviewResponse {
    private long totalRequests;
    private long totalSuccessful;
    private long totalFailed;
    private BigDecimal totalCostTry;
    private BigDecimal totalCostUsd;
    private BigDecimal monthCostTry;
    private BigDecimal monthCostUsd;
    private List<ProviderStatsResponse> providers;
    private List<DailyBillingStats> dailyStats;

    public BillingOverviewResponse() {}

    // getters & setters
    public long getTotalRequests() { return totalRequests; }
    public void setTotalRequests(long totalRequests) { this.totalRequests = totalRequests; }
    public long getTotalSuccessful() { return totalSuccessful; }
    public void setTotalSuccessful(long totalSuccessful) { this.totalSuccessful = totalSuccessful; }
    public long getTotalFailed() { return totalFailed; }
    public void setTotalFailed(long totalFailed) { this.totalFailed = totalFailed; }
    public BigDecimal getTotalCostTry() { return totalCostTry; }
    public void setTotalCostTry(BigDecimal totalCostTry) { this.totalCostTry = totalCostTry; }
    public BigDecimal getTotalCostUsd() { return totalCostUsd; }
    public void setTotalCostUsd(BigDecimal totalCostUsd) { this.totalCostUsd = totalCostUsd; }
    public BigDecimal getMonthCostTry() { return monthCostTry; }
    public void setMonthCostTry(BigDecimal monthCostTry) { this.monthCostTry = monthCostTry; }
    public BigDecimal getMonthCostUsd() { return monthCostUsd; }
    public void setMonthCostUsd(BigDecimal monthCostUsd) { this.monthCostUsd = monthCostUsd; }
    public List<ProviderStatsResponse> getProviders() { return providers; }
    public void setProviders(List<ProviderStatsResponse> providers) { this.providers = providers; }
    public List<DailyBillingStats> getDailyStats() { return dailyStats; }
    public void setDailyStats(List<DailyBillingStats> dailyStats) { this.dailyStats = dailyStats; }

    public static class DailyBillingStats {
        private String date;
        private String provider;
        private long count;
        private BigDecimal cost;

        public DailyBillingStats() {}
        public DailyBillingStats(String date, String provider, long count, BigDecimal cost) {
            this.date = date; this.provider = provider; this.count = count; this.cost = cost;
        }
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public String getProvider() { return provider; }
        public void setProvider(String provider) { this.provider = provider; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
        public BigDecimal getCost() { return cost; }
        public void setCost(BigDecimal cost) { this.cost = cost; }
    }
}
