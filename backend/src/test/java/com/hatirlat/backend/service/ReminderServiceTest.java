package com.hatirlat.backend.service;

import com.hatirlat.backend.dto.*;
import com.hatirlat.backend.entity.*;
import com.hatirlat.backend.repository.ContactRepository;
import com.hatirlat.backend.repository.GroupRepository;
import com.hatirlat.backend.repository.ReminderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReminderServiceTest {

    @Mock
    private ReminderRepository reminderRepository;

    @Mock
    private ContactRepository contactRepository;

    @Mock
    private GroupRepository groupRepository;

    @InjectMocks
    private ReminderService reminderService;

    private ReminderRequest reminderRequest;
    private Reminder reminder;
    private Group group;
    private Contact contact;

    @BeforeEach
    void setUp() {
        reminderRequest = new ReminderRequest();
        reminderRequest.setTitle("Test Reminder");
        reminderRequest.setType("personal");
        reminderRequest.setMessage("Test message");
        reminderRequest.setDateTime(LocalDateTime.now().plusDays(1));
        reminderRequest.setStatus("scheduled");
        reminderRequest.setChannels(Arrays.asList("email"));
        reminderRequest.setRepeat("none");

        contact = new Contact();
        contact.setId(1L);
        contact.setName("Test Contact");
        contact.setEmail("test@example.com");
        contact.setPhone("1234567890");

        group = new Group();
        group.setId(1L);
        group.setName("Test Group");

        reminder = new Reminder();
        reminder.setId(1L);
        reminder.setTitle("Test Reminder");
        reminder.setType(ReminderType.PERSONAL);
        reminder.setMessage("Test message");
        reminder.setDateTime(LocalDateTime.now().plusDays(1));
        reminder.setStatus(ReminderStatus.SCHEDULED);
        reminder.setChannels(Arrays.asList(NotificationChannel.EMAIL));
        reminder.setRepeat(RepeatType.NONE);
        reminder.setContact(contact);
        reminder.setGroup(group);
    }

    @Test
    void getAllReminders_ReturnsListOfReminders() {
        when(reminderRepository.findAll()).thenReturn(Arrays.asList(reminder));

        List<ReminderResponse> reminders = reminderService.getAllReminders();

        assertEquals(1, reminders.size());
        assertEquals("Test Reminder", reminders.get(0).getTitle());
        assertEquals("personal", reminders.get(0).getType());
        verify(reminderRepository, times(1)).findAll();
    }

    @Test
    void getReminderById_ExistingReminder_ReturnsReminder() {
        when(reminderRepository.findById(1L)).thenReturn(Optional.of(reminder));

        ReminderResponse response = reminderService.getReminderById("1");

        assertNotNull(response);
        assertEquals("Test Reminder", response.getTitle());
        verify(reminderRepository, times(1)).findById(1L);
    }

    @Test
    void getReminderById_NonExistingReminder_ReturnsNull() {
        when(reminderRepository.findById(999L)).thenReturn(Optional.empty());

        ReminderResponse response = reminderService.getReminderById("999");

        assertNull(response);
        verify(reminderRepository, times(1)).findById(999L);
    }
    
    @Test
    void createReminder_WithGroup_ReturnsCreatedReminder() {
        // Setup for group-type reminder
        reminderRequest.setType("group");
        reminderRequest.setGroupId("1");
        
        when(reminderRepository.save(any(Reminder.class))).thenReturn(reminder);
        when(groupRepository.findById(1L)).thenReturn(Optional.of(group));

        ReminderResponse response = reminderService.createReminder(reminderRequest);

        assertNotNull(response);
        assertEquals("Test Reminder", response.getTitle());
        assertEquals("group", response.getType());
        verify(reminderRepository, times(1)).save(any(Reminder.class));
        verify(groupRepository, times(1)).findById(1L); // Group lookup should be called
    }

    @Test
    void createReminder_ValidRequest_ReturnsCreatedReminder() {
        // Since reminderRequest has type "personal" and no groupId, groupRepository.findById shouldn't be called
        when(reminderRepository.save(any(Reminder.class))).thenReturn(reminder);

        ReminderResponse response = reminderService.createReminder(reminderRequest);

        assertNotNull(response);
        assertEquals("Test Reminder", response.getTitle());
        assertEquals("personal", response.getType());
        verify(reminderRepository, times(1)).save(any(Reminder.class));
        verify(groupRepository, never()).findById(anyLong()); // Ensure group lookup wasn't called for personal reminder
    }

    @Test
    void updateReminder_ExistingReminder_ReturnsUpdatedReminder() {
        reminderRequest.setTitle("Updated Reminder");
        when(reminderRepository.findById(1L)).thenReturn(Optional.of(reminder));
        when(reminderRepository.save(any(Reminder.class))).thenReturn(reminder);

        ReminderResponse response = reminderService.updateReminder("1", reminderRequest);

        assertNotNull(response);
        assertEquals("Updated Reminder", response.getTitle());
        verify(reminderRepository, times(1)).findById(1L);
        verify(reminderRepository, times(1)).save(any(Reminder.class));
        verify(groupRepository, never()).findById(anyLong()); // Ensure group lookup wasn't called for personal reminder
    }

    @Test
    void updateReminder_NonExistingReminder_ReturnsNull() {
        when(reminderRepository.findById(999L)).thenReturn(Optional.empty());

        ReminderResponse response = reminderService.updateReminder("999", reminderRequest);

        assertNull(response);
        verify(reminderRepository, times(1)).findById(999L);
    }

    @Test
    void updateReminderStatus_ExistingReminder_ReturnsUpdatedReminder() {
        when(reminderRepository.findById(1L)).thenReturn(Optional.of(reminder));
        when(reminderRepository.save(any(Reminder.class))).thenReturn(reminder);

        ReminderResponse response = reminderService.updateReminderStatus("1", "paused");

        assertNotNull(response);
        assertEquals("paused", response.getStatus());
        verify(reminderRepository, times(1)).findById(1L);
        verify(reminderRepository, times(1)).save(any(Reminder.class));
    }

    @Test
    void updateReminderStatus_NonExistingReminder_ReturnsNull() {
        when(reminderRepository.findById(999L)).thenReturn(Optional.empty());

        ReminderResponse response = reminderService.updateReminderStatus("999", "paused");

        assertNull(response);
        verify(reminderRepository, times(1)).findById(999L);
    }

    @Test
    void deleteReminder_ExistingReminder_ReturnsTrue() {
        when(reminderRepository.existsById(1L)).thenReturn(true);

        boolean result = reminderService.deleteReminder("1");

        assertTrue(result);
        verify(reminderRepository, times(1)).existsById(1L);
        verify(reminderRepository, times(1)).deleteById(1L);
    }

    @Test
    void deleteReminder_NonExistingReminder_ReturnsFalse() {
        when(reminderRepository.existsById(999L)).thenReturn(false);

        boolean result = reminderService.deleteReminder("999");

        assertFalse(result);
        verify(reminderRepository, times(1)).existsById(999L);
        verify(reminderRepository, never()).deleteById(999L);
    }
}