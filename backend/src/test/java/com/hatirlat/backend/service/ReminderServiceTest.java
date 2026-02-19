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

    private Reminder reminder;
    private ReminderResponse reminderResponse;
    private ReminderRequest reminderRequest;

    @BeforeEach
    void setUp() {
        reminder = new Reminder();
        reminder.setId(1L);
        reminder.setTitle("Test Reminder");
        reminder.setMessage("Test Message");
        reminder.setDateTime(LocalDateTime.now());
        reminder.setType(ReminderType.PERSONAL);
        reminder.setStatus(ReminderStatus.SCHEDULED);
        reminder.setChannels(Arrays.asList(NotificationChannel.EMAIL));
        reminder.setRepeat(RepeatType.NONE);

        reminderResponse = new ReminderResponse();
        reminderResponse.setId("1");
        reminderResponse.setTitle("Test Reminder");
        reminderResponse.setMessage("Test Message");

        reminderRequest = new ReminderRequest();
        reminderRequest.setTitle("Test Reminder");
        reminderRequest.setMessage("Test Message");
        reminderRequest.setDateTime(LocalDateTime.now());
        reminderRequest.setType("personal");
        reminderRequest.setStatus("scheduled");
        reminderRequest.setChannels(Arrays.asList("email"));
        reminderRequest.setRepeat("none");
    }

    @Test
    void testGetAllReminders() {
        // Given
        when(reminderRepository.findAll()).thenReturn(Arrays.asList(reminder));
        when(reminderMapper.toDto(reminder)).thenReturn(reminderResponse);

        // When
        List<ReminderResponse> result = reminderService.getAllReminders();

        // Then
        assertEquals(1, result.size());
        assertEquals("Test Reminder", result.get(0).getTitle());
        verify(reminderRepository, times(1)).findAll();
        verify(reminderMapper, times(1)).toDto(reminder);
    }

    @Test
    void testGetReminderById() {
        // Given
        when(reminderRepository.findById(1L)).thenReturn(Optional.of(reminder));
        when(reminderMapper.toDto(reminder)).thenReturn(reminderResponse);

        // When
        ReminderResponse result = reminderService.getReminderById("1");

        // Then
        assertEquals("1", result.getId());
        assertEquals("Test Reminder", result.getTitle());
        verify(reminderRepository, times(1)).findById(1L);
    }

    @Test
    void testGetReminderById_NotFound() {
        // Given
        when(reminderRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            reminderService.getReminderById("1");
        });
        verify(reminderRepository, times(1)).findById(1L);
    }

    @Test
    void testCreateReminder() {
        // Given
        Contact contact = new Contact();
        contact.setId(1L);
        contact.setName("Test Contact");
        
        ContactRequest contactRequest = new ContactRequest();
        contactRequest.setName("Test Contact");
        
        when(contactMapper.toEntity(any(ContactRequest.class))).thenReturn(contact);
        when(contactRepository.save(any(Contact.class))).thenReturn(contact);
        when(reminderRepository.save(any(Reminder.class))).thenReturn(reminder);
        when(reminderMapper.toDto(any(Reminder.class))).thenReturn(reminderResponse);
        
        reminderRequest.setContact(contactRequest);

        // When
        ReminderResponse result = reminderService.createReminder(reminderRequest);

        // Then
        assertEquals("1", result.getId());
        verify(reminderRepository, times(1)).save(any(Reminder.class));
    }

    @Test
    void testUpdateReminder() {
        // Given
        when(reminderRepository.findById(1L)).thenReturn(Optional.of(reminder));
        when(reminderRepository.save(any(Reminder.class))).thenReturn(reminder);
        when(reminderMapper.toDto(any(Reminder.class))).thenReturn(reminderResponse);

        // When
        ReminderResponse result = reminderService.updateReminder("1", reminderRequest);

        // Then
        assertEquals("1", result.getId());
        verify(reminderRepository, times(1)).findById(1L);
        verify(reminderRepository, times(1)).save(any(Reminder.class));
    }

    @Test
    void testUpdateReminder_NotFound() {
        // Given
        when(reminderRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            reminderService.updateReminder("1", reminderRequest);
        });
        verify(reminderRepository, times(1)).findById(1L);
    }

    @Test
    void testDeleteReminder() {
        // Given
        when(reminderRepository.existsById(1L)).thenReturn(true);

        // When
        boolean result = reminderService.deleteReminder("1");

        // Then
        assertTrue(result);
        verify(reminderRepository, times(1)).deleteById(1L);
    }

    @Test
    void testDeleteReminder_NotFound() {
        // Given
        when(reminderRepository.existsById(1L)).thenReturn(false);

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            reminderService.deleteReminder("1");
        });
        verify(reminderRepository, times(1)).existsById(1L);
    }
}