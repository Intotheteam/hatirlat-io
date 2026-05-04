package com.hatirlat.backend.controller;

import com.hatirlat.backend.dto.*;
import com.hatirlat.backend.entity.NotificationChannel;
import com.hatirlat.backend.entity.ReminderStatus;
import com.hatirlat.backend.entity.ReminderType;
import com.hatirlat.backend.entity.RepeatType;
import com.hatirlat.backend.service.ReminderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import com.hatirlat.backend.exception.ResourceNotFoundException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReminderControllerTest {

    @Mock
    private ReminderService reminderService;

    @InjectMocks
    private ReminderController reminderController;

    private ReminderRequest reminderRequest;
    private ReminderResponse reminderResponse;
    private com.hatirlat.backend.entity.User testUser;

    @BeforeEach
    void setUp() {
        testUser = new com.hatirlat.backend.entity.User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setRole(com.hatirlat.backend.entity.Role.USER);

        reminderRequest = new ReminderRequest();
        reminderRequest.setTitle("Test Reminder");
        reminderRequest.setType("personal");
        reminderRequest.setMessage("Test message");
        reminderRequest.setDateTime(LocalDateTime.now().plusDays(1));
        reminderRequest.setStatus("scheduled");
        reminderRequest.setChannels(Arrays.asList("email"));
        reminderRequest.setRepeat("none");

        reminderResponse = new ReminderResponse();
        reminderResponse.setId("1");
        reminderResponse.setTitle("Test Reminder");
        reminderResponse.setType("personal");
        reminderResponse.setMessage("Test message");
        reminderResponse.setDateTime(LocalDateTime.now().plusDays(1));
        reminderResponse.setStatus("scheduled");
        reminderResponse.setChannels(Arrays.asList("email"));
        reminderResponse.setRepeat("none");
    }

    @Test
    void getAllReminders_ReturnsListOfReminders() {
        List<ReminderResponse> reminders = Arrays.asList(reminderResponse);
        when(reminderService.getAllReminders(testUser)).thenReturn(reminders);

        ResponseEntity<BaseResponse<List<ReminderResponse>>> response = reminderController.getAllReminders(null, testUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals(1, response.getBody().getData().size());
        assertEquals("Test Reminder", response.getBody().getData().get(0).getTitle());
        verify(reminderService, times(1)).getAllReminders(testUser);
    }

    @Test
    void getReminderById_ExistingReminder_ReturnsReminder() {
        when(reminderService.getReminderById("1", testUser)).thenReturn(reminderResponse);

        ResponseEntity<BaseResponse<ReminderResponse>> response = reminderController.getReminderById("1", testUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Test Reminder", response.getBody().getData().getTitle());
        verify(reminderService, times(1)).getReminderById("1", testUser);
    }

    @Test
    void getReminderById_NonExistingReminder_ThrowsResourceNotFoundException() {
        when(reminderService.getReminderById("999", testUser))
                .thenThrow(new ResourceNotFoundException("Reminder", "999"));

        assertThrows(ResourceNotFoundException.class, () -> {
            reminderController.getReminderById("999", testUser);
        });

        verify(reminderService, times(1)).getReminderById("999", testUser);
    }

    @Test
    void createReminder_ValidRequest_ReturnsCreatedReminder() {
        when(reminderService.createReminder(any(ReminderRequest.class), eq(testUser))).thenReturn(reminderResponse);

        ResponseEntity<BaseResponse<ReminderResponse>> response = reminderController.createReminder(reminderRequest, testUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Test Reminder", response.getBody().getData().getTitle());
        verify(reminderService, times(1)).createReminder(any(ReminderRequest.class), eq(testUser));
    }

    @Test
    void updateReminder_ExistingReminder_ReturnsUpdatedReminder() {
        when(reminderService.updateReminder(eq("1"), any(ReminderRequest.class), eq(testUser))).thenReturn(reminderResponse);

        ResponseEntity<BaseResponse<ReminderResponse>> response = reminderController.updateReminder("1", reminderRequest, testUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Test Reminder", response.getBody().getData().getTitle());
        verify(reminderService, times(1)).updateReminder(eq("1"), any(ReminderRequest.class), eq(testUser));
    }

    @Test
    void updateReminder_NonExistingReminder_ThrowsResourceNotFoundException() {
        when(reminderService.updateReminder(eq("999"), any(ReminderRequest.class), eq(testUser)))
                .thenThrow(new ResourceNotFoundException("Reminder", "999"));

        assertThrows(ResourceNotFoundException.class, () -> {
            reminderController.updateReminder("999", reminderRequest, testUser);
        });

        verify(reminderService, times(1)).updateReminder(eq("999"), any(ReminderRequest.class), eq(testUser));
    }

    @Test
    void updateReminderStatus_ExistingReminder_ReturnsUpdatedReminder() {
        StatusUpdateRequest statusRequest = new StatusUpdateRequest();
        statusRequest.setStatus("paused");
        
        // Create a response object with the expected updated status
        ReminderResponse updatedReminderResponse = new ReminderResponse();
        updatedReminderResponse.setId("1");
        updatedReminderResponse.setTitle("Test Reminder");
        updatedReminderResponse.setType("personal");
        updatedReminderResponse.setMessage("Test message");
        updatedReminderResponse.setDateTime(LocalDateTime.now().plusDays(1));
        updatedReminderResponse.setStatus("paused"); // Updated status
        updatedReminderResponse.setChannels(Arrays.asList("email"));
        updatedReminderResponse.setRepeat("none");
        
        when(reminderService.updateReminderStatus(eq("1"), eq("paused"), eq(testUser))).thenReturn(updatedReminderResponse);

        ResponseEntity<BaseResponse<ReminderResponse>> response = reminderController.updateReminderStatus("1", statusRequest, testUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("paused", response.getBody().getData().getStatus());
        verify(reminderService, times(1)).updateReminderStatus(eq("1"), eq("paused"), eq(testUser));
    }

    @Test
    void deleteReminder_ExistingReminder_ReturnsSuccess() {
        when(reminderService.deleteReminder("1", testUser)).thenReturn(true);

        ResponseEntity<BaseResponse<Void>> response = reminderController.deleteReminder("1", testUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        verify(reminderService, times(1)).deleteReminder("1", testUser);
    }

    @Test
    void deleteReminder_NonExistingReminder_ThrowsResourceNotFoundException() {
        doThrow(new ResourceNotFoundException("Reminder", "999"))
                .when(reminderService).deleteReminder("999", testUser);

        assertThrows(ResourceNotFoundException.class, () -> {
            reminderController.deleteReminder("999", testUser);
        });

        verify(reminderService, times(1)).deleteReminder("999", testUser);
    }
}