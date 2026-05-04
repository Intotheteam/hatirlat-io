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
        LocalDateTime now = LocalDateTime.now();
        log.info("━━━━━ [Scheduler] Scan started at {} ━━━━━", now);

        List<Reminder> scheduledReminders = reminderRepository.findByStatusAndDateTimeBefore(
                ReminderStatus.SCHEDULED,
                now);

        int total = scheduledReminders.size();
        int sent = 0, rescheduled = 0, failed = 0;

        if (total == 0) {
            log.info("[Scheduler] No due reminders found. Next scan in ~60s.");
        } else {
            log.info("[Scheduler] Found {} due reminder(s) to process.", total);
        }

        for (Reminder reminder : scheduledReminders) {
            try {
                notificationService.sendNotification(reminder);

                if (isRecurring(reminder)) {
                    LocalDateTime nextDateTime = calculateNextDateTime(reminder);
                    if (nextDateTime != null) {
                        reminder.setDateTime(nextDateTime);
                        reminder.setStatus(ReminderStatus.SCHEDULED);
                        reminderRepository.save(reminder);
                        log.info("[Scheduler] ✓ RESCHEDULED  id={} title='{}' nextAt={}",
                                reminder.getId(), reminder.getTitle(), nextDateTime);
                        rescheduled++;
                    } else {
                        reminder.setStatus(ReminderStatus.SENT);
                        reminderRepository.save(reminder);
                        log.info("[Scheduler] ✓ SENT (recurring, no next date)  id={} title='{}'",
                                reminder.getId(), reminder.getTitle());
                        sent++;
                    }
                } else {
                    reminder.setStatus(ReminderStatus.SENT);
                    reminderRepository.save(reminder);
                    log.info("[Scheduler] ✓ SENT  id={} title='{}'",
                            reminder.getId(), reminder.getTitle());
                    sent++;
                }
            } catch (Exception e) {
                log.error("[Scheduler] ✗ FAILED  id={} title='{}' error={}",
                        reminder.getId(), reminder.getTitle(), e.getMessage());
                reminder.setStatus(ReminderStatus.FAILED);
                reminderRepository.save(reminder);
                failed++;
            }
        }

        if (total > 0) {
            log.info("[Scheduler] ── Summary: total={} sent={} rescheduled={} failed={} ──",
                    total, sent, rescheduled, failed);
        }
        log.info("━━━━━ [Scheduler] Scan finished ━━━━━");
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

        LocalDateTime next;
        switch (repeatType) {
            case HOURLY:
                next = current.plusHours(1);
                break;
            case DAILY:
                next = current.plusDays(1);
                break;
            case WEEKLY:
                next = current.plusWeeks(1);
                break;
            case CUSTOM:
                next = calculateCustomNextDateTime(reminder, current);
                break;
            default:
                return null;
        }

        // Stop if next firing would exceed the configured end date
        if (next != null && reminder.getEndDate() != null && next.isAfter(reminder.getEndDate())) {
            log.info("[Scheduler] Reminder id={} reached endDate={}, stopping recurrence.",
                    reminder.getId(), reminder.getEndDate());
            return null;
        }

        return next;
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
