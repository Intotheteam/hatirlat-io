package com.hatirlat.backend.service;

import com.hatirlat.backend.entity.SystemStats;
import com.hatirlat.backend.entity.Role;
import com.hatirlat.backend.entity.ReminderStatus;
import com.hatirlat.backend.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service for calculating and caching system-wide statistics.
 * Stats are pre-calculated daily to avoid expensive queries on admin dashboard.
 */
@Service
@Transactional
public class SystemStatsService {

    private static final Logger logger = LoggerFactory.getLogger(SystemStatsService.class);

    @Autowired
    private SystemStatsRepository statsRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReminderRepository reminderRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Get or calculate stats for today
     */
    @Transactional(readOnly = true)
    public SystemStats getTodayStats() {
        Optional<SystemStats> existing = statsRepository.findToday();
        if (existing.isPresent()) {
            return existing.get();
        }

        // If not found, calculate and return (but don't save - let scheduled job do that)
        logger.info("Today's stats not found in cache, calculating now");
        return calculateStatsForDate(LocalDate.now());
    }

    /**
     * Get stats for a specific date
     */
    @Transactional(readOnly = true)
    public SystemStats getStatsForDate(LocalDate date) {
        return statsRepository.findByDate(date)
            .orElseGet(() -> calculateStatsForDate(date));
    }

    /**
     * Get stats for the last N days
     */
    @Transactional(readOnly = true)
    public List<SystemStats> getRecentStats(int days) {
        LocalDate startDate = LocalDate.now().minusDays(days);
        return statsRepository.findRecentStats(startDate);
    }

    /**
     * Get stats for the last 7 days
     */
    @Transactional(readOnly = true)
    public List<SystemStats> getLast7DaysStats() {
        return statsRepository.findLast7Days();
    }

    /**
     * Get stats for the last 30 days
     */
    @Transactional(readOnly = true)
    public List<SystemStats> getLast30DaysStats() {
        return statsRepository.findLast30Days();
    }

    /**
     * Calculate and save stats for today
     * Scheduled to run daily at midnight
     */
    @Scheduled(cron = "0 0 0 * * ?") // Every day at midnight
    public void calculateAndSaveTodayStats() {
        logger.info("Running scheduled daily stats calculation");
        SystemStats stats = calculateStatsForDate(LocalDate.now());
        statsRepository.save(stats);
        logger.info("Daily stats saved: {} users, {} reminders sent", stats.getTotalUsers(), stats.getSentToday());
    }

    /**
     * Force recalculation of stats for a specific date
     */
    public SystemStats recalculateStatsForDate(LocalDate date) {
        logger.info("Forcing recalculation of stats for {}", date);
        SystemStats stats = calculateStatsForDate(date);
        statsRepository.save(stats);
        return stats;
    }

    /**
     * Calculate stats for a specific date (core logic)
     */
    private SystemStats calculateStatsForDate(LocalDate date) {
        SystemStats stats = new SystemStats();
        stats.setDate(date);

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();

        // User metrics
        stats.setTotalUsers(userRepository.count());
        stats.setPremiumUsers(userRepository.countByPremiumTrue());
        stats.setNewUsersToday(userRepository.countByCreatedAtBetween(startOfDay, endOfDay));

        // Reminder metrics
        stats.setTotalReminders(reminderRepository.count());
        stats.setActiveReminders(reminderRepository.countByStatus(ReminderStatus.SCHEDULED));

        // Group metrics
        stats.setTotalGroups(groupRepository.count());

        // Notification metrics (today only)
        stats.setSentToday(notificationLogRepository.countByCreatedAtBetween(startOfDay, endOfDay));
        stats.setFailedToday(notificationLogRepository.countByStatusAndCreatedAtBetween(
            com.hatirlat.backend.entity.NotificationLogStatus.FAILED, startOfDay, endOfDay));

        // Channel breakdown
        stats.setEmailCount(notificationLogRepository.countByChannelAndCreatedAtBetween(
            com.hatirlat.backend.entity.NotificationChannel.EMAIL, startOfDay, endOfDay));
        stats.setSmsCount(notificationLogRepository.countByChannelAndCreatedAtBetween(
            com.hatirlat.backend.entity.NotificationChannel.SMS, startOfDay, endOfDay));
        stats.setWhatsappCount(notificationLogRepository.countByChannelAndCreatedAtBetween(
            com.hatirlat.backend.entity.NotificationChannel.WHATSAPP, startOfDay, endOfDay));

        // Calculate additional metrics
        Map<String, Object> additionalMetrics = calculateAdditionalMetrics(startOfDay, endOfDay);
        try {
            stats.setAdditionalMetrics(objectMapper.writeValueAsString(additionalMetrics));
        } catch (JsonProcessingException e) {
            logger.error("Failed to serialize additional metrics", e);
        }

        return stats;
    }

    /**
     * Calculate additional metrics (stored as JSON)
     */
    private Map<String, Object> calculateAdditionalMetrics(LocalDateTime startOfDay, LocalDateTime endOfDay) {
        Map<String, Object> metrics = new HashMap<>();

        // Success rate
        long totalSent = notificationLogRepository.countByCreatedAtBetween(startOfDay, endOfDay);
        long failed = notificationLogRepository.countByStatusAndCreatedAtBetween(
            com.hatirlat.backend.entity.NotificationLogStatus.FAILED, startOfDay, endOfDay);
        double successRate = totalSent > 0 ? ((totalSent - failed) * 100.0 / totalSent) : 100.0;
        metrics.put("successRate", String.format("%.2f", successRate));

        // Active users (users with at least one active reminder)
        long activeUsers = userRepository.countUsersWithActiveReminders();
        metrics.put("activeUsers", activeUsers);

        // Average reminders per user
        long totalUsers = userRepository.count();
        long totalReminders = reminderRepository.count();
        double avgRemindersPerUser = totalUsers > 0 ? (totalReminders * 1.0 / totalUsers) : 0;
        metrics.put("avgRemindersPerUser", String.format("%.2f", avgRemindersPerUser));

        // Channel preferences
        long emailUsers = notificationLogRepository.countDistinctUsersByChannel("EMAIL");
        long smsUsers = notificationLogRepository.countDistinctUsersByChannel("SMS");
        long whatsappUsers = notificationLogRepository.countDistinctUsersByChannel("WHATSAPP");
        metrics.put("emailUsers", emailUsers);
        metrics.put("smsUsers", smsUsers);
        metrics.put("whatsappUsers", whatsappUsers);

        return metrics;
    }

    /**
     * Get additional metrics as a Map (deserialize JSON)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getAdditionalMetrics(SystemStats stats) {
        String json = stats.getAdditionalMetrics();
        if (json == null || json.isEmpty()) {
            return new HashMap<>();
        }

        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (JsonProcessingException e) {
            logger.error("Failed to deserialize additional metrics", e);
            return new HashMap<>();
        }
    }

    /**
     * Get dashboard summary (today + trends)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardSummary() {
        SystemStats today = getTodayStats();
        List<SystemStats> last7Days = getLast7DaysStats();

        Map<String, Object> summary = new HashMap<>();

        // Today's stats
        summary.put("today", today);
        summary.put("todayAdditionalMetrics", getAdditionalMetrics(today));

        // 7-day trends
        if (last7Days.size() >= 2) {
            SystemStats weekAgo = last7Days.get(last7Days.size() - 1);

            long userGrowth = today.getTotalUsers() - weekAgo.getTotalUsers();
            long reminderGrowth = today.getTotalReminders() - weekAgo.getTotalReminders();

            summary.put("userGrowth7d", userGrowth);
            summary.put("reminderGrowth7d", reminderGrowth);
        }

        // Weekly totals
        long weeklyNotifications = last7Days.stream().mapToLong(SystemStats::getSentToday).sum();
        long weeklyFailed = last7Days.stream().mapToLong(SystemStats::getFailedToday).sum();

        summary.put("weeklyNotifications", weeklyNotifications);
        summary.put("weeklyFailed", weeklyFailed);
        summary.put("last7Days", last7Days);

        return summary;
    }

    /**
     * Cleanup old statistics (keep only last 90 days)
     * Scheduled to run monthly
     */
    @Scheduled(cron = "0 0 0 1 * ?") // First day of each month at midnight
    public void cleanupOldStats() {
        LocalDate cutoffDate = LocalDate.now().minusDays(90);
        logger.info("Cleaning up stats older than {}", cutoffDate);
        statsRepository.deleteByDateBefore(cutoffDate);
    }
}
