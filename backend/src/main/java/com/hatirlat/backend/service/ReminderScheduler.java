package com.hatirlat.backend.service;

import com.hatirlat.backend.entity.*;
import com.hatirlat.backend.repository.ReminderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Service
public class ReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(ReminderScheduler.class);

    @Autowired
    private ReminderRepository reminderRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * Scheduled job that runs every minute to check for scheduled reminders
     * that need to be sent.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void processScheduledReminders() {
        log.info("Checking for scheduled reminders at: {}", LocalDateTime.now());

        List<Reminder> scheduledReminders = reminderRepository.findByStatusAndDateTimeBefore(
            ReminderStatus.SCHEDULED,
            LocalDateTime.now()
        );

        for (Reminder reminder : scheduledReminders) {
            try {
                // Send the notification
                notificationService.sendNotification(reminder);

                // Handle recurring reminders
                if (isRecurring(reminder)) {
                    LocalDateTime nextDateTime = calculateNextDateTime(reminder);
                    if (nextDateTime != null) {
                        reminder.setDateTime(nextDateTime);
                        reminder.setStatus(ReminderStatus.SCHEDULED);
                        reminderRepository.save(reminder);
                        log.info("Recurring reminder '{}' rescheduled to: {}", reminder.getTitle(), nextDateTime);
                    } else {
                        // Could not calculate next time, mark as sent
                        reminder.setStatus(ReminderStatus.SENT);
                        reminderRepository.save(reminder);
                        log.info("Recurring reminder '{}' completed (no next date)", reminder.getTitle());
                    }
                } else {
                    // One-time reminder, mark as sent
                    reminder.setStatus(ReminderStatus.SENT);
                    reminderRepository.save(reminder);
                    log.info("Reminder processed and status updated to SENT: {}", reminder.getTitle());
                }
            } catch (Exception e) {
                log.error("Error processing reminder: {}, Error: {}", reminder.getTitle(), e.getMessage());
                reminder.setStatus(ReminderStatus.FAILED);
                reminderRepository.save(reminder);
            }
        }
    }

    /**
     * Check if a reminder is recurring (not NONE repeat type).
     */
    private boolean isRecurring(Reminder reminder) {
        return reminder.getRepeat() != null && reminder.getRepeat() != RepeatType.NONE;
    }

    /**
     * Calculate the next execution date/time based on the repeat type.
     */
    private LocalDateTime calculateNextDateTime(Reminder reminder) {
        LocalDateTime current = reminder.getDateTime();
        RepeatType repeatType = reminder.getRepeat();

        if (current == null || repeatType == null) {
            return null;
        }

        switch (repeatType) {
            case HOURLY:
                return current.plusHours(1);
            case DAILY:
                return current.plusDays(1);
            case WEEKLY:
                return current.plusWeeks(1);
            case CUSTOM:
                return calculateCustomNextDateTime(reminder, current);
            default:
                return null;
        }
    }

    /**
     * Calculate next date/time for CUSTOM repeat type using CustomRepeatConfig.
     */
    private LocalDateTime calculateCustomNextDateTime(Reminder reminder, LocalDateTime current) {
        CustomRepeatConfig config = reminder.getCustomRepeatConfig();
        if (config == null) {
            log.warn("Custom repeat config is null for reminder: {}", reminder.getTitle());
            return null;
        }

        int interval = config.getInterval() != null ? config.getInterval() : 1;
        RepeatFrequency frequency = config.getFrequency();

        if (frequency == null) {
            return null;
        }

        switch (frequency) {
            case DAY:
                return current.plusDays(interval);
            case WEEK:
                // If specific days of week are set, find the next matching day
                if (config.getDaysOfWeek() != null && !config.getDaysOfWeek().isEmpty()) {
                    return findNextDayOfWeek(current, config.getDaysOfWeek(), interval);
                }
                return current.plusWeeks(interval);
            case MONTH:
                return current.plusMonths(interval);
            default:
                return null;
        }
    }

    /**
     * Find the next occurrence based on specific days of the week.
     */
    private LocalDateTime findNextDayOfWeek(LocalDateTime current, List<DayOfWeek> daysOfWeek, int weekInterval) {
        LocalDateTime next = current;

        for (int i = 1; i <= 7; i++) {
            next = current.plusDays(i);
            java.time.DayOfWeek javaDow = next.getDayOfWeek();
            DayOfWeek appDow = convertJavaDayOfWeek(javaDow);

            if (daysOfWeek.contains(appDow)) {
                return next;
            }
        }

        // If no matching day found in current week, jump to next interval
        return current.plusWeeks(weekInterval);
    }

    /**
     * Convert java.time.DayOfWeek to our custom DayOfWeek enum.
     */
    private DayOfWeek convertJavaDayOfWeek(java.time.DayOfWeek javaDow) {
        return switch (javaDow) {
            case MONDAY -> DayOfWeek.MON;
            case TUESDAY -> DayOfWeek.TUE;
            case WEDNESDAY -> DayOfWeek.WED;
            case THURSDAY -> DayOfWeek.THU;
            case FRIDAY -> DayOfWeek.FRI;
            case SATURDAY -> DayOfWeek.SAT;
            case SUNDAY -> DayOfWeek.SUN;
        };
    }
}
