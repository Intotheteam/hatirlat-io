package com.hatirlat.backend.service;

import com.hatirlat.backend.entity.*;
import com.hatirlat.backend.notification.NotificationStrategy;
import com.hatirlat.backend.repository.NotificationLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private final Map<NotificationChannel, NotificationStrategy> strategies;
    private final NotificationLogRepository notificationLogRepository;
    private final MemberService memberService; // To fetch group members

    public NotificationService(List<NotificationStrategy> notificationStrategies,
            NotificationLogRepository notificationLogRepository,
            MemberService memberService) {
        this.strategies = notificationStrategies.stream()
                .collect(Collectors.toMap(
                        NotificationStrategy::getChannelType,
                        strategy -> strategy));
        this.notificationLogRepository = notificationLogRepository;
        this.memberService = memberService;
    }

    /**
     * Send notification for a Reminder entity.
     * Extracts channels, recipient, message, and subject from the reminder.
     * Logs each notification attempt to NotificationLog table.
     */
    public void sendNotification(Reminder reminder) {
        List<NotificationChannel> channels = reminder.getChannels();
        if (channels == null || channels.isEmpty()) {
            logger.warn("No notification channels specified for reminder: {}", reminder.getTitle());
            return;
        }

        String subject = reminder.getTitle();
        String message = reminder.getMessage();

        // 1. If it's a group reminder, broadcast to all members (skip INACTIVE)
        if (reminder.getGroup() != null) {
            Group group = reminder.getGroup();
            logger.info("Broadcasting notification for group reminder '{}' to group ID {}", subject, group.getId());

            // Re-use MemberService to get members. Note: MemberResponse is returned, we can
            // use its status and email/phone.
            var members = memberService.getGroupMembers(String.valueOf(group.getId()));
            for (var m : members) {
                // Skip INACTIVE members
                if ("INACTIVE".equalsIgnoreCase(m.getStatus())) {
                    logger.debug("Skipping inactive member: {}", m.getEmail());
                    continue;
                }

                String recipient = resolveRecipientFromMember(m);
                if (recipient != null && !recipient.isBlank()) {
                    dispatchToChannels(reminder, channels, recipient, message, subject);
                }
            }
            return; // Finished broadcasting to group
        }

        // 2. Individual reminder logic
        String recipient = resolveRecipient(reminder);
        if (recipient == null || recipient.isBlank()) {
            logger.warn("No recipient found for reminder: {}", reminder.getTitle());
            return;
        }

        logger.info("Sending notification for reminder '{}' via {} channels to '{}'",
                subject, channels.size(), recipient);

        dispatchToChannels(reminder, channels, recipient, message, subject);
    }

    private void dispatchToChannels(Reminder reminder, List<NotificationChannel> channels, String recipient,
            String message, String subject) {
        for (NotificationChannel channel : channels) {
            try {
                sendNotification(channel, recipient, message, subject);
                // Log success
                saveNotificationLog(reminder, channel, recipient, NotificationLogStatus.SUCCESS, null);
                logger.debug("Notification sent via {} for reminder '{}'", channel, subject);
            } catch (Exception e) {
                // Log failure
                saveNotificationLog(reminder, channel, recipient, NotificationLogStatus.FAILED, e.getMessage());
                logger.error("Failed to send notification via {} for reminder '{}': {}",
                        channel, subject, e.getMessage());
                throw e;
            }
        }
    }

    public void sendNotification(List<NotificationChannel> channels, String recipient, String message, String subject) {
        for (NotificationChannel channel : channels) {
            sendNotification(channel, recipient, message, subject);
        }
    }

    public void sendNotification(NotificationChannel channel, String recipient, String message, String subject) {
        NotificationStrategy strategy = strategies.get(channel);
        if (strategy != null) {
            strategy.sendNotification(recipient, message, subject);
        } else {
            throw new IllegalArgumentException("Unsupported notification channel: " + channel);
        }
    }

    /**
     * Save a notification log entry.
     */
    private void saveNotificationLog(Reminder reminder, NotificationChannel channel,
            String recipient, NotificationLogStatus status, String errorMessage) {
        try {
            NotificationLog log = new NotificationLog();
            log.setReminder(reminder);
            log.setUser(reminder.getUser());
            log.setChannel(channel);
            log.setRecipient(recipient);
            log.setStatus(status);
            log.setErrorMessage(errorMessage);
            log.setSentAt(LocalDateTime.now());
            notificationLogRepository.save(log);
        } catch (Exception e) {
            logger.error("Failed to save notification log: {}", e.getMessage());
        }
    }

    /**
     * Resolves the recipient from the reminder's contact or user.
     */
    private String resolveRecipient(Reminder reminder) {
        Contact contact = reminder.getContact();
        if (contact != null) {
            if (contact.getEmail() != null && !contact.getEmail().isBlank()) {
                return contact.getEmail();
            }
            if (contact.getPhone() != null && !contact.getPhone().isBlank()) {
                return contact.getPhone();
            }
        }

        // Fallback to reminder owner's email
        if (reminder.getUser() != null && reminder.getUser().getEmail() != null) {
            return reminder.getUser().getEmail();
        }

        return null;
    }

    /**
     * Resolves the recipient from a group member response.
     */
    private String resolveRecipientFromMember(com.hatirlat.backend.dto.MemberResponse member) {
        if (member.getEmail() != null && !member.getEmail().isBlank()) {
            return member.getEmail();
        }
        if (member.getPhone() != null && !member.getPhone().isBlank()) {
            return member.getPhone();
        }
        return null;
    }
}
