package com.hatirlat.backend.service;

import com.hatirlat.backend.dto.*;
import com.hatirlat.backend.entity.*;
import com.hatirlat.backend.exception.ResourceNotFoundException;
import com.hatirlat.backend.mapper.ContactMapper;
import com.hatirlat.backend.mapper.ReminderMapper;
import com.hatirlat.backend.repository.ContactRepository;
import com.hatirlat.backend.repository.CustomRepeatConfigRepository;
import com.hatirlat.backend.repository.GroupRepository;
import com.hatirlat.backend.repository.MemberRepository;
import com.hatirlat.backend.repository.ReminderRepository;
import com.hatirlat.backend.util.LoggingUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReminderServiceTest {

    @Mock
    private ReminderRepository reminderRepository;

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private ContactRepository contactRepository;

    @Mock
    private CustomRepeatConfigRepository customRepeatConfigRepository;

    @Mock
    private ReminderMapper reminderMapper;

    @Mock
    private ContactMapper contactMapper;

    @Mock
    private LoggingUtil loggingUtil;

    @InjectMocks
    private ReminderService reminderService;

    private ReminderRequest reminderRequest;
    private Reminder personalReminder;
    private Reminder reminderWithGroupId;
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

        personalReminder = new Reminder();
        personalReminder.setId(1L);
        personalReminder.setTitle("Test Reminder");
        personalReminder.setType(ReminderType.PERSONAL);
        personalReminder.setMessage("Test message");
        personalReminder.setDateTime(LocalDateTime.now().plusDays(1));
        personalReminder.setStatus(ReminderStatus.SCHEDULED);
        personalReminder.setChannels(Arrays.asList(NotificationChannel.EMAIL));
        personalReminder.setRepeat(RepeatType.NONE);

        reminderWithGroupId = new Reminder();
        reminderWithGroupId.setId(2L);
        reminderWithGroupId.setTitle("Group Reminder");
        reminderWithGroupId.setType(ReminderType.GROUP);
        reminderWithGroupId.setMessage("Group message");
        reminderWithGroupId.setDateTime(LocalDateTime.now().plusDays(1));
        reminderWithGroupId.setStatus(ReminderStatus.SCHEDULED);
        reminderWithGroupId.setChannels(Arrays.asList(NotificationChannel.EMAIL));
        reminderWithGroupId.setRepeat(RepeatType.NONE);
        reminderWithGroupId.setGroupId(1L);
    }

    @Test
    void getAllReminders_ReturnsListOfReminders() {
        when(reminderRepository.findAll()).thenReturn(Arrays.asList(personalReminder));

        List<ReminderResponse> result = reminderService.getAllReminders();

        assertEquals(1, result.size());
        assertEquals("Test Reminder", result.get(0).getTitle());
        verify(reminderRepository, times(1)).findAll();
    }

    @Test
    void getReminderById_ExistingReminder_ReturnsReminder() {
        when(reminderRepository.findById(1L)).thenReturn(Optional.of(personalReminder));

        ReminderResponse result = reminderService.getReminderById("1");

        assertEquals("1", result.getId());
        assertEquals("Test Reminder", result.getTitle());
        verify(reminderRepository, times(1)).findById(1L);
    }

    @Test
    void getReminderById_NonExistingReminder_ThrowsResourceNotFoundException() {
        when(reminderRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            reminderService.getReminderById("999");
        });

        verify(reminderRepository, times(1)).findById(999L);
    }

    @Test
    void createReminder_WithGroup_ReturnsCreatedReminder() {
        reminderRequest.setType("group");
        reminderRequest.setGroupId("1");

        when(groupRepository.existsById(1L)).thenReturn(true);
        when(reminderRepository.save(any(Reminder.class))).thenReturn(reminderWithGroupId);
        when(groupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(memberRepository.findMembersByGroupId(1L)).thenReturn(Collections.emptyList());

        ReminderResponse response = reminderService.createReminder(reminderRequest);

        assertNotNull(response);
        assertEquals("Group Reminder", response.getTitle());
        assertEquals("group", response.getType());
        verify(reminderRepository, times(1)).save(any(Reminder.class));
    }

    @Test
    void createReminder_ValidPersonalRequest_ReturnsCreatedReminder() {
        when(reminderRepository.save(any(Reminder.class))).thenReturn(personalReminder);

        ReminderResponse response = reminderService.createReminder(reminderRequest);

        assertNotNull(response);
        assertEquals("Test Reminder", response.getTitle());
        assertEquals("personal", response.getType());
        verify(reminderRepository, times(1)).save(any(Reminder.class));
        verify(contactRepository, never()).save(any(Contact.class));
        verify(groupRepository, never()).existsById(anyLong());
    }

    @Test
    void updateReminder_ExistingReminder_ReturnsUpdatedReminder() {
        reminderRequest.setTitle("Updated Reminder");
        when(reminderRepository.findById(1L)).thenReturn(Optional.of(personalReminder));
        when(reminderRepository.save(any(Reminder.class))).thenReturn(personalReminder);

        ReminderResponse response = reminderService.updateReminder("1", reminderRequest);

        assertNotNull(response);
        verify(reminderRepository, times(1)).findById(1L);
        verify(reminderRepository, times(1)).save(any(Reminder.class));
    }

    @Test
    void updateReminder_NonExistingReminder_ThrowsResourceNotFoundException() {
        when(reminderRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            reminderService.updateReminder("999", reminderRequest);
        });

        verify(reminderRepository, times(1)).findById(999L);
    }

    @Test
    void updateReminderStatus_ExistingReminder_ReturnsUpdatedReminder() {
        Reminder pausedReminder = new Reminder();
        pausedReminder.setId(1L);
        pausedReminder.setTitle("Test Reminder");
        pausedReminder.setType(ReminderType.PERSONAL);
        pausedReminder.setStatus(ReminderStatus.PAUSED);
        pausedReminder.setChannels(Arrays.asList(NotificationChannel.EMAIL));
        pausedReminder.setRepeat(RepeatType.NONE);

        when(reminderRepository.findById(1L)).thenReturn(Optional.of(personalReminder));
        when(reminderRepository.save(any(Reminder.class))).thenReturn(pausedReminder);

        ReminderResponse result = reminderService.updateReminderStatus("1", "paused");

        assertNotNull(result);
        assertEquals("paused", result.getStatus());
        verify(reminderRepository, times(1)).findById(1L);
        verify(reminderRepository, times(1)).save(any(Reminder.class));
    }

    @Test
    void updateReminderStatus_NonExistingReminder_ThrowsResourceNotFoundException() {
        when(reminderRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            reminderService.updateReminderStatus("999", "paused");
        });

        verify(reminderRepository, times(1)).findById(999L);
    }

    @Test
    void testDeleteReminder() {
        when(reminderRepository.existsById(1L)).thenReturn(true);

        boolean result = reminderService.deleteReminder("1");

        assertTrue(result);
        verify(reminderRepository, times(1)).deleteById(1L);
    }

    @Test
    void deleteReminder_NonExistingReminder_ThrowsResourceNotFoundException() {
        when(reminderRepository.existsById(999L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> {
            reminderService.deleteReminder("999");
        });

        verify(reminderRepository, times(1)).existsById(999L);
        verify(reminderRepository, never()).deleteById(999L);
    }
}
