package com.hatirlat.backend.dto;

import com.hatirlat.backend.entity.DayOfWeek;
import com.hatirlat.backend.entity.NotificationChannel;
import com.hatirlat.backend.entity.RepeatFrequency;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class DtoTests {

    @Test
    void baseResponse_GettersAndSetters() {
        BaseResponse<String> response = new BaseResponse<>();
        response.setSuccess(true);
        response.setData("test data");
        response.setMessage("test message");

        assertTrue(response.isSuccess());
        assertEquals("test data", response.getData());
        assertEquals("test message", response.getMessage());

        BaseResponse<String> responseWithConstructor = new BaseResponse<>(true, "test data", "test message");
        assertTrue(responseWithConstructor.isSuccess());
        assertEquals("test data", responseWithConstructor.getData());
        assertEquals("test message", responseWithConstructor.getMessage());
    }

    @Test
    void errorResponse_GettersAndSetters() {
        ErrorResponse.ErrorDetails errorDetails = new ErrorResponse.ErrorDetails("ERROR_CODE", "Error message");
        errorDetails.setDetails("Detailed error info");

        assertEquals("ERROR_CODE", errorDetails.getCode());
        assertEquals("Error message", errorDetails.getMessage());
        assertEquals("Detailed error info", errorDetails.getDetails());

        ErrorResponse errorResponse = new ErrorResponse("ERROR_CODE", "Error message");
        assertFalse(errorResponse.isSuccess());
        assertNotNull(errorResponse.getError());
        assertEquals("ERROR_CODE", errorResponse.getError().getCode());
    }

    @Test
    void reminderRequest_GettersAndSetters() {
        ReminderRequest request = new ReminderRequest();
        request.setTitle("Test title");
        request.setType("personal");
        request.setMessage("Test message");
        request.setDateTime(LocalDateTime.now());
        request.setStatus("scheduled");
        request.setChannels(Arrays.asList("email", "sms"));
        request.setRepeat("daily");

        ContactRequest contact = new ContactRequest();
        contact.setName("Contact Name");
        contact.setPhone("1234567890");
        contact.setEmail("test@example.com");
        request.setContact(contact);

        GroupRequest group = new GroupRequest();
        group.setName("Group Name");
        group.setDescription("Group Description");
        request.setGroup(group);

        CustomRepeatRequest customRepeat = new CustomRepeatRequest();
        customRepeat.setInterval(2);
        customRepeat.setFrequency("week");
        customRepeat.setDaysOfWeek(Arrays.asList("mon", "wed", "fri"));
        request.setCustomRepeat(customRepeat);

        assertEquals("Test title", request.getTitle());
        assertEquals("personal", request.getType());
        assertEquals("Test message", request.getMessage());
        assertEquals("scheduled", request.getStatus());
        assertEquals(Arrays.asList("email", "sms"), request.getChannels());
        assertEquals("daily", request.getRepeat());
        assertEquals(contact, request.getContact());
        assertEquals(group, request.getGroup());
        assertEquals(customRepeat, request.getCustomRepeat());
    }

    @Test
    void reminderResponse_GettersAndSetters() {
        ReminderResponse response = new ReminderResponse();
        response.setId("1");
        response.setTitle("Test title");
        response.setType("group");
        response.setMessage("Test message");
        response.setDateTime(LocalDateTime.now());
        response.setStatus("sent");
        response.setChannels(Arrays.asList("whatsapp"));
        response.setRepeat("weekly");

        ContactRequest contact = new ContactRequest();
        contact.setName("Contact Name");
        response.setContact(contact);

        GroupResponse group = new GroupResponse();
        group.setName("Group Name");
        response.setGroup(group);

        CustomRepeatRequest customRepeat = new CustomRepeatRequest();
        customRepeat.setInterval(3);
        response.setCustomRepeat(customRepeat);

        assertEquals("1", response.getId());
        assertEquals("Test title", response.getTitle());
        assertEquals("group", response.getType());
        assertEquals("Test message", response.getMessage());
        assertEquals("sent", response.getStatus());
        assertEquals(Arrays.asList("whatsapp"), response.getChannels());
        assertEquals("weekly", response.getRepeat());
        assertEquals(contact, response.getContact());
        assertEquals(group, response.getGroup());
        assertEquals(customRepeat, response.getCustomRepeat());
    }

    @Test
    void authRequest_GettersAndSetters() {
        AuthRequest request = new AuthRequest();
        request.setUsername("testuser");
        request.setPassword("password");

        assertEquals("testuser", request.getUsername());
        assertEquals("password", request.getPassword());
    }

    @Test
    void authResponse_GettersAndSetters() {
        AuthResponse response = new AuthResponse();
        response.setToken("test-token");
        response.setRefreshToken("refresh-token");
        response.setType("Bearer");
        response.setExpiresIn(3600L);

        UserResponse userResponse = new UserResponse();
        userResponse.setUsername("testuser");
        response.setUser(userResponse);

        assertEquals("test-token", response.getToken());
        assertEquals("refresh-token", response.getRefreshToken());
        assertEquals("Bearer", response.getType());
        assertEquals(3600L, response.getExpiresIn());
        assertEquals(userResponse, response.getUser());
    }

    @Test
    void userResponse_GettersAndSetters() {
        UserResponse response = new UserResponse();
        response.setId("1");
        response.setUsername("testuser");
        response.setEmail("test@example.com");
        response.setRole("USER");

        assertEquals("1", response.getId());
        assertEquals("testuser", response.getUsername());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("USER", response.getRole());
    }

    @Test
    void groupRequest_GettersAndSetters() {
        GroupRequest request = new GroupRequest();
        request.setName("Test Group");
        request.setDescription("Test Description");

        assertEquals("Test Group", request.getName());
        assertEquals("Test Description", request.getDescription());
    }

    @Test
    void groupResponse_GettersAndSetters() {
        GroupResponse response = new GroupResponse();
        response.setId("1");
        response.setName("Test Group");
        response.setDescription("Test Description");
        response.setMemberCount(5);
        response.setCreatedAt(LocalDateTime.now());

        assertEquals("1", response.getId());
        assertEquals("Test Group", response.getName());
        assertEquals("Test Description", response.getDescription());
        assertEquals(5, response.getMemberCount());
        assertNotNull(response.getCreatedAt());
    }

    @Test
    void memberRequest_GettersAndSetters() {
        MemberRequest request = new MemberRequest();
        request.setName("Test Member");
        request.setEmail("test@example.com");
        request.setPhone("1234567890");
        request.setRole("Admin");

        assertEquals("Test Member", request.getName());
        assertEquals("test@example.com", request.getEmail());
        assertEquals("1234567890", request.getPhone());
        assertEquals("Admin", request.getRole());
    }

    @Test
    void memberResponse_GettersAndSetters() {
        MemberResponse response = new MemberResponse();
        response.setId("1");
        response.setName("Test Member");
        response.setEmail("test@example.com");
        response.setRole("Member");
        response.setStatus("Active");
        response.setPhone("1234567890");
        response.setJoinedAt(LocalDateTime.now());
        response.setLastActivity(LocalDateTime.now());

        assertEquals("1", response.getId());
        assertEquals("Test Member", response.getName());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("Member", response.getRole());
        assertEquals("Active", response.getStatus());
        assertEquals("1234567890", response.getPhone());
        assertNotNull(response.getJoinedAt());
        assertNotNull(response.getLastActivity());
    }

    @Test
    void contactRequest_GettersAndSetters() {
        ContactRequest request = new ContactRequest();
        request.setName("Test Contact");
        request.setPhone("1234567890");
        request.setEmail("test@example.com");

        assertEquals("Test Contact", request.getName());
        assertEquals("1234567890", request.getPhone());
        assertEquals("test@example.com", request.getEmail());
    }

    @Test
    void contactResponse_GettersAndSetters() {
        ContactResponse response = new ContactResponse();
        response.setId("1");
        response.setName("Test Contact");
        response.setPhone("1234567890");
        response.setEmail("test@example.com");

        assertEquals("1", response.getId());
        assertEquals("Test Contact", response.getName());
        assertEquals("1234567890", response.getPhone());
        assertEquals("test@example.com", response.getEmail());
    }

    @Test
    void customRepeatRequest_GettersAndSetters() {
        CustomRepeatRequest request = new CustomRepeatRequest();
        request.setInterval(5);
        request.setFrequency("month");
        request.setDaysOfWeek(Arrays.asList("mon", "fri"));

        assertEquals(5, request.getInterval());
        assertEquals("month", request.getFrequency());
        assertEquals(Arrays.asList("mon", "fri"), request.getDaysOfWeek());
    }

    @Test
    void statusUpdateRequest_GettersAndSetters() {
        StatusUpdateRequest request = new StatusUpdateRequest();
        request.setStatus("paused");

        assertEquals("paused", request.getStatus());
    }

    @Test
    void inviteRequest_GettersAndSetters() {
        InviteRequest request = new InviteRequest();
        request.setEmail("test@example.com");
        request.setGroupId("1");

        assertEquals("test@example.com", request.getEmail());
        assertEquals("1", request.getGroupId());
    }
}