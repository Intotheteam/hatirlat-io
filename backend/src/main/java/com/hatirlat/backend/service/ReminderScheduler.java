package com.hatirlat.backend.service;

import com.hatirlat.backend.entity.Reminder;
import com.hatirlat.backend.entity.ReminderStatus;
import com.hatirlat.backend.repository.ReminderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
    @Scheduled(fixedRate = 60000) // Run every minute (60,000 milliseconds)
    public void processScheduledReminders() {
        log.info("Checking for scheduled reminders at: {}", LocalDateTime.now());
        
        // Find all scheduled reminders that should be sent now or before
        List<Reminder> scheduledReminders = reminderRepository.findByStatusAndDateTimeBefore(
            ReminderStatus.SCHEDULED, 
            LocalDateTime.now()
        );
        
        for (Reminder reminder : scheduledReminders) {
            try {
                // Send the notification
                notificationService.sendNotification(reminder);
                
                // Update the status to SENT
                reminder.setStatus(ReminderStatus.SENT);
                reminderRepository.save(reminder);
                
                log.info("Reminder processed and status updated: {}", reminder.getTitle());
            } catch (Exception e) {
                log.error("Error processing reminder: {}, Error: {}", reminder.getTitle(), e.getMessage());
                
                // Update the status to FAILED
                reminder.setStatus(ReminderStatus.FAILED);
                reminderRepository.save(reminder);
            }
        }
    }
}