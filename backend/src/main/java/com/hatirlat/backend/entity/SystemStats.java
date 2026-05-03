package com.hatirlat.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * System statistics entity for caching daily metrics.
 * Used by admin dashboard to display system health and usage statistics.
 */
@Entity
@Table(name = "system_stats", indexes = {
    @Index(name = "idx_date", columnList = "date", unique = true)
})
public class SystemStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Date for which these statistics are calculated
     */
    @Column(nullable = false, unique = true)
    private LocalDate date;

    // User Statistics
    @Column(name = "total_users")
    private Long totalUsers = 0L;

    @Column(name = "premium_users")
    private Long premiumUsers = 0L;

    @Column(name = "free_users")
    private Long freeUsers = 0L;

    @Column(name = "new_users_today")
    private Long newUsersToday = 0L;

    // Reminder Statistics
    @Column(name = "total_reminders")
    private Long totalReminders = 0L;

    @Column(name = "active_reminders")
    private Long activeReminders = 0L;

    @Column(name = "sent_today")
    private Long sentToday = 0L;

    @Column(name = "failed_today")
    private Long failedToday = 0L;

    @Column(name = "scheduled_for_today")
    private Long scheduledForToday = 0L;

    // Notification Channel Statistics
    @Column(name = "sms_count")
    private Long smsCount = 0L;

    @Column(name = "email_count")
    private Long emailCount = 0L;

    @Column(name = "whatsapp_count")
    private Long whatsappCount = 0L;

    // Group Statistics
    @Column(name = "total_groups")
    private Long totalGroups = 0L;

    @Column(name = "active_groups")
    private Long activeGroups = 0L;

    // Revenue/Credits Statistics
    @Column(name = "credits_consumed_today")
    private Long creditsConsumedToday = 0L;

    @Column(name = "credits_purchased_today")
    private Long creditsPurchasedToday = 0L;

    /**
     * Additional metrics in JSON format for flexibility
     * Example: {"avg_reminders_per_user": 5.2, "most_active_hour": 14}
     */
    @Column(name = "additional_metrics", columnDefinition = "TEXT")
    private String additionalMetrics;

    /**
     * When these statistics were calculated
     */
    @Column(name = "calculated_at", nullable = false)
    private LocalDateTime calculatedAt;

    // Lifecycle callback
    @PrePersist
    protected void onCreate() {
        if (calculatedAt == null) {
            calculatedAt = LocalDateTime.now();
        }
        if (date == null) {
            date = LocalDate.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        calculatedAt = LocalDateTime.now();
    }

    // Constructors
    public SystemStats() {
    }

    public SystemStats(LocalDate date) {
        this.date = date;
        this.calculatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(Long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public Long getPremiumUsers() {
        return premiumUsers;
    }

    public void setPremiumUsers(Long premiumUsers) {
        this.premiumUsers = premiumUsers;
    }

    public Long getFreeUsers() {
        return freeUsers;
    }

    public void setFreeUsers(Long freeUsers) {
        this.freeUsers = freeUsers;
    }

    public Long getNewUsersToday() {
        return newUsersToday;
    }

    public void setNewUsersToday(Long newUsersToday) {
        this.newUsersToday = newUsersToday;
    }

    public Long getTotalReminders() {
        return totalReminders;
    }

    public void setTotalReminders(Long totalReminders) {
        this.totalReminders = totalReminders;
    }

    public Long getActiveReminders() {
        return activeReminders;
    }

    public void setActiveReminders(Long activeReminders) {
        this.activeReminders = activeReminders;
    }

    public Long getSentToday() {
        return sentToday;
    }

    public void setSentToday(Long sentToday) {
        this.sentToday = sentToday;
    }

    public Long getFailedToday() {
        return failedToday;
    }

    public void setFailedToday(Long failedToday) {
        this.failedToday = failedToday;
    }

    public Long getScheduledForToday() {
        return scheduledForToday;
    }

    public void setScheduledForToday(Long scheduledForToday) {
        this.scheduledForToday = scheduledForToday;
    }

    public Long getSmsCount() {
        return smsCount;
    }

    public void setSmsCount(Long smsCount) {
        this.smsCount = smsCount;
    }

    public Long getEmailCount() {
        return emailCount;
    }

    public void setEmailCount(Long emailCount) {
        this.emailCount = emailCount;
    }

    public Long getWhatsappCount() {
        return whatsappCount;
    }

    public void setWhatsappCount(Long whatsappCount) {
        this.whatsappCount = whatsappCount;
    }

    public Long getTotalGroups() {
        return totalGroups;
    }

    public void setTotalGroups(Long totalGroups) {
        this.totalGroups = totalGroups = totalGroups;
    }

    public Long getActiveGroups() {
        return activeGroups;
    }

    public void setActiveGroups(Long activeGroups) {
        this.activeGroups = activeGroups;
    }

    public Long getCreditsConsumedToday() {
        return creditsConsumedToday;
    }

    public void setCreditsConsumedToday(Long creditsConsumedToday) {
        this.creditsConsumedToday = creditsConsumedToday;
    }

    public Long getCreditsPurchasedToday() {
        return creditsPurchasedToday;
    }

    public void setCreditsPurchasedToday(Long creditsPurchasedToday) {
        this.creditsPurchasedToday = creditsPurchasedToday;
    }

    public String getAdditionalMetrics() {
        return additionalMetrics;
    }

    public void setAdditionalMetrics(String additionalMetrics) {
        this.additionalMetrics = additionalMetrics;
    }

    public LocalDateTime getCalculatedAt() {
        return calculatedAt;
    }

    public void setCalculatedAt(LocalDateTime calculatedAt) {
        this.calculatedAt = calculatedAt;
    }
}
