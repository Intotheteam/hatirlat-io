package com.hatirlat.backend.service;

import com.hatirlat.backend.entity.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @InjectMocks
    private NotificationService notificationService;

    private Reminder reminder;

    @BeforeEach
    void setUp() {
        reminder = new Reminder();
        reminder.setTitle("Test Reminder");
        reminder.setMessage("Test message");
        reminder.setChannels(Arrays.asList(NotificationChannel.EMAIL, NotificationChannel.SMS));
    }

    @Test
    void sendNotification_WithMultipleChannels_SendsAllNotifications() {
        // Since the method is a dummy implementation that just prints to console,
        // we can't directly test the internal workings, but we can ensure it doesn't throw exceptions
        assertDoesNotThrow(() -> {
            notificationService.sendNotification(reminder);
        });
    }

    @Test
    void sendNotification_WithNullChannels_SendsNoNotifications() {
        Reminder reminderWithoutChannels = new Reminder();
        reminderWithoutChannels.setTitle("Test Reminder");
        reminderWithoutChannels.setMessage("Test message");
        reminderWithoutChannels.setChannels(null);

        assertDoesNotThrow(() -> {
            notificationService.sendNotification(reminderWithoutChannels);
        });
    }
}