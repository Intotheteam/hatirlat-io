package com.hatirlat.backend.controller;

import com.hatirlat.backend.dto.*;
import com.hatirlat.backend.service.AuditLogService;
import com.hatirlat.backend.service.GroupService;
import jakarta.servlet.http.HttpServletRequest;
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
class GroupControllerTest {

    @Mock
    private GroupService groupService;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private HttpServletRequest httpServletRequest;

    @InjectMocks
    private GroupController groupController;

    private GroupRequest groupRequest;
    private GroupResponse groupResponse;
    private com.hatirlat.backend.entity.User testUser;

    @BeforeEach
    void setUp() {
        testUser = new com.hatirlat.backend.entity.User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setRole(com.hatirlat.backend.entity.Role.USER);

        groupRequest = new GroupRequest();
        groupRequest.setName("Test Group");
        groupRequest.setDescription("Test Description");

        groupResponse = new GroupResponse();
        groupResponse.setId("1");
        groupResponse.setName("Test Group");
        groupResponse.setDescription("Test Description");
        groupResponse.setCreatedAt(LocalDateTime.now());
        groupResponse.setMemberCount(2);
    }

    @Test
    void getAllGroups_ReturnsListOfGroups() {
        List<GroupResponse> groups = Arrays.asList(groupResponse);
        when(groupService.getAllGroups(testUser)).thenReturn(groups);

        ResponseEntity<BaseResponse<List<GroupResponse>>> response = groupController.getAllGroups(testUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals(1, response.getBody().getData().size());
        assertEquals("Test Group", response.getBody().getData().get(0).getName());
        verify(groupService, times(1)).getAllGroups(testUser);
    }

    @Test
    void getGroupById_ExistingGroup_ReturnsGroup() {
        when(groupService.getGroupById("1", testUser)).thenReturn(groupResponse);

        ResponseEntity<BaseResponse<GroupResponse>> response = groupController.getGroupById("1", testUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Test Group", response.getBody().getData().getName());
        verify(groupService, times(1)).getGroupById("1", testUser);
    }

    @Test
    void getGroupById_NonExistingGroup_ThrowsResourceNotFoundException() {
        when(groupService.getGroupById("999", testUser))
                .thenThrow(new ResourceNotFoundException("Group", "999"));

        assertThrows(ResourceNotFoundException.class, () -> {
            groupController.getGroupById("999", testUser);
        });

        verify(groupService, times(1)).getGroupById("999", testUser);
    }

    @Test
    void createGroup_ValidRequest_ReturnsCreatedGroup() {
        when(groupService.createGroup(any(GroupRequest.class), eq(testUser))).thenReturn(groupResponse);

        ResponseEntity<BaseResponse<GroupResponse>> response = groupController.createGroup(groupRequest, testUser, httpServletRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Test Group", response.getBody().getData().getName());
        verify(groupService, times(1)).createGroup(any(GroupRequest.class), eq(testUser));
    }

    @Test
    void updateGroup_ExistingGroup_ReturnsUpdatedGroup() {
        when(groupService.updateGroup(eq("1"), any(GroupRequest.class), eq(testUser))).thenReturn(groupResponse);

        ResponseEntity<BaseResponse<GroupResponse>> response = groupController.updateGroup("1", groupRequest, testUser, httpServletRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Test Group", response.getBody().getData().getName());
        verify(groupService, times(1)).updateGroup(eq("1"), any(GroupRequest.class), eq(testUser));
    }

    @Test
    void updateGroup_NonExistingGroup_ThrowsResourceNotFoundException() {
        when(groupService.updateGroup(eq("999"), any(GroupRequest.class), eq(testUser)))
                .thenThrow(new ResourceNotFoundException("Group", "999"));

        assertThrows(ResourceNotFoundException.class, () -> {
            groupController.updateGroup("999", groupRequest, testUser, httpServletRequest);
        });

        verify(groupService, times(1)).updateGroup(eq("999"), any(GroupRequest.class), eq(testUser));
    }

    @Test
    void deleteGroup_ExistingGroup_ReturnsSuccess() {
        when(groupService.getGroupById("1", testUser)).thenReturn(groupResponse);
        when(groupService.deleteGroup("1", testUser)).thenReturn(true);

        ResponseEntity<BaseResponse<Void>> response = groupController.deleteGroup("1", testUser, httpServletRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        verify(groupService, times(1)).deleteGroup("1", testUser);
    }

    @Test
    void deleteGroup_NonExistingGroup_ThrowsResourceNotFoundException() {
        when(groupService.getGroupById("999", testUser)).thenThrow(new ResourceNotFoundException("Group", "999"));

        assertThrows(ResourceNotFoundException.class, () -> {
            groupController.deleteGroup("999", testUser, httpServletRequest);
        });

        verify(groupService, times(1)).deleteGroup("999", testUser);
    }
}