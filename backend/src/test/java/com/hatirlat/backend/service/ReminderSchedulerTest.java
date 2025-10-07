package com.hatirlat.backend.service;

import com.hatirlat.backend.entity.NotificationChannel;
import com.hatirlat.backend.entity.Reminder;
import com.hatirlat.backend.entity.ReminderStatus;
import com.hatirlat.backend.entity.ReminderType;
import com.hatirlat.backend.repository.ReminderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReminderSchedulerTest {

    @Mock
    private ReminderRepository reminderRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ReminderScheduler reminderScheduler;

    private Reminder scheduledReminder;

    @BeforeEach
    void setUp() {
        scheduledReminder = new Reminder();
        scheduledReminder.setId(1L);
        scheduledReminder.setTitle("Scheduled Reminder");
        scheduledReminder.setMessage("Test message");
        scheduledReminder.setDateTime(LocalDateTime.now().minusHours(1)); // Past time
        scheduledReminder.setStatus(ReminderStatus.SCHEDULED);
        scheduledReminder.setChannels(Arrays.asList(NotificationChannel.EMAIL));
        scheduledReminder.setType(ReminderType.PERSONAL);
    }

    @Test
    void processScheduledReminders_WithScheduledReminders_SendsNotifications() {
        List<Reminder> scheduledReminders = Arrays.asList(scheduledReminder);
        when(reminderRepository.findByStatusAndDateTimeBefore(
                eq(ReminderStatus.SCHEDULED), 
                any(LocalDateTime.class)
        )).thenReturn(scheduledReminders);

        reminderScheduler.processScheduledReminders();

        verify(notificationService, times(1)).sendNotification(scheduledReminder);
        ArgumentCaptor<Reminder> reminderCaptor = ArgumentCaptor.forClass(Reminder.class);
        verify(reminderRepository, times(1)).save(reminderCaptor.capture());
        assertEquals(ReminderStatus.SENT, reminderCaptor.getValue().getStatus());
    }

    @Test
    void processScheduledReminders_WithNoScheduledReminders_DoesNothing() {
        when(reminderRepository.findByStatusAndDateTimeBefore(
                eq(ReminderStatus.SCHEDULED), 
                any(LocalDateTime.class)
        )).thenReturn(Arrays.asList());

        reminderScheduler.processScheduledReminders();

        verify(notificationService, never()).sendNotification(any(Reminder.class));
        verify(reminderRepository, never()).save(any(Reminder.class));
    }

    @Test
    void processScheduledReminders_WithNotificationFailure_UpdatesStatusToFailed() {
        scheduledReminder = new Reminder();
        scheduledReminder.setId(2L);
        scheduledReminder.setTitle("Failed Reminder");
        scheduledReminder.setMessage("Test message");
        scheduledReminder.setDateTime(LocalDateTime.now().minusHours(1)); // Past time
        scheduledReminder.setStatus(ReminderStatus.SCHEDULED);
        scheduledReminder.setChannels(Arrays.asList(NotificationChannel.EMAIL));
        scheduledReminder.setType(ReminderType.PERSONAL);

        List<Reminder> scheduledReminders = Arrays.asList(scheduledReminder);
        when(reminderRepository.findByStatusAndDateTimeBefore(
                eq(ReminderStatus.SCHEDULED), 
                any(LocalDateTime.class)
        )).thenReturn(scheduledReminders);
        
        doThrow(new RuntimeException("Notification failed")).when(notificationService).sendNotification(scheduledReminder);

        assertDoesNotThrow(() -> reminderScheduler.processScheduledReminders());

        ArgumentCaptor<Reminder> reminderCaptor = ArgumentCaptor.forClass(Reminder.class);
        verify(reminderRepository, times(1)).save(reminderCaptor.capture());
        assertEquals(ReminderStatus.FAILED, reminderCaptor.getValue().getStatus());
    }
}