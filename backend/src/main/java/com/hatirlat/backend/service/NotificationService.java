package com.hatirlat.backend.service;

import com.hatirlat.backend.entity.NotificationChannel;
import com.hatirlat.backend.entity.Reminder;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    /**
     * This is a dummy method to simulate sending notifications.
     * In a real implementation, this would integrate with email/SMS/WhatsApp services.
     */
    @CircuitBreaker(name = "default", fallbackMethod = "sendNotificationFallback")
    @Retry(name = "default")
    public void sendNotification(Reminder reminder) {
        log.info("Sending notification for reminder: {}", reminder.getTitle());

        // Simulate sending notifications via different channels
        if (reminder.getChannels() != null) {
            for (NotificationChannel channel : reminder.getChannels()) {
                switch (channel) {
                    case EMAIL:
                        sendEmailNotification(reminder);
                        break;
                    case SMS:
                        sendSmsNotification(reminder);
                        break;
                    case WHATSAPP:
                        sendWhatsAppNotification(reminder);
                        break;
                    default:
                        break;
                }
            }
        }

        log.info("Notification sent for reminder: {}", reminder.getTitle());
    }

    // Fallback signature must match the original method with an extra Throwable at the end
    private void sendNotificationFallback(Reminder reminder, Throwable throwable) {
        log.warn("Fallback invoked for sendNotification. title={}, reason={}",
                reminder != null ? reminder.getTitle() : "<null>",
                throwable != null ? throwable.getMessage() : "<unknown>");
        // Optionally enqueue for later retry or persist a failure record
    }

    private void sendEmailNotification(Reminder reminder) {
        log.debug("Sending EMAIL notification: {}", reminder.getMessage());
        // In a real implementation, you would use JavaMailSender or similar
    }

    private void sendSmsNotification(Reminder reminder) {
        log.debug("Sending SMS notification: {}", reminder.getMessage());
        // In a real implementation, you would integrate with an SMS service like Twilio
    }

    private void sendWhatsAppNotification(Reminder reminder) {
        log.debug("Sending WHATSAPP notification: {}", reminder.getMessage());
        // In a real implementation, you would use WhatsApp Business API
    }
}