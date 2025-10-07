package com.hatirlat.backend.controller;

import com.hatirlat.backend.dto.*;
import com.hatirlat.backend.service.GroupService;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GroupControllerTest {

    @Mock
    private GroupService groupService;

    @InjectMocks
    private GroupController groupController;

    private GroupRequest groupRequest;
    private GroupResponse groupResponse;

    @BeforeEach
    void setUp() {
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
        when(groupService.getAllGroups()).thenReturn(groups);

        ResponseEntity<BaseResponse<List<GroupResponse>>> response = groupController.getAllGroups();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals(1, response.getBody().getData().size());
        assertEquals("Test Group", response.getBody().getData().get(0).getName());
        verify(groupService, times(1)).getAllGroups();
    }

    @Test
    void getGroupById_ExistingGroup_ReturnsGroup() {
        when(groupService.getGroupById("1")).thenReturn(groupResponse);

        ResponseEntity<BaseResponse<GroupResponse>> response = groupController.getGroupById("1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Test Group", response.getBody().getData().getName());
        verify(groupService, times(1)).getGroupById("1");
    }

    @Test
    void getGroupById_NonExistingGroup_ReturnsNotFound() {
        when(groupService.getGroupById("999")).thenReturn(null);

        ResponseEntity<BaseResponse<GroupResponse>> response = groupController.getGroupById("999");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertNull(response.getBody().getData());
        verify(groupService, times(1)).getGroupById("999");
    }

    @Test
    void createGroup_ValidRequest_ReturnsCreatedGroup() {
        when(groupService.createGroup(any(GroupRequest.class))).thenReturn(groupResponse);

        ResponseEntity<BaseResponse<GroupResponse>> response = groupController.createGroup(groupRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Test Group", response.getBody().getData().getName());
        verify(groupService, times(1)).createGroup(any(GroupRequest.class));
    }

    @Test
    void updateGroup_ExistingGroup_ReturnsUpdatedGroup() {
        when(groupService.updateGroup(eq("1"), any(GroupRequest.class))).thenReturn(groupResponse);

        ResponseEntity<BaseResponse<GroupResponse>> response = groupController.updateGroup("1", groupRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Test Group", response.getBody().getData().getName());
        verify(groupService, times(1)).updateGroup(eq("1"), any(GroupRequest.class));
    }

    @Test
    void updateGroup_NonExistingGroup_ReturnsNotFound() {
        when(groupService.updateGroup(eq("999"), any(GroupRequest.class))).thenReturn(null);

        ResponseEntity<BaseResponse<GroupResponse>> response = groupController.updateGroup("999", groupRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertNull(response.getBody().getData());
        verify(groupService, times(1)).updateGroup(eq("999"), any(GroupRequest.class));
    }

    @Test
    void deleteGroup_ExistingGroup_ReturnsSuccess() {
        when(groupService.deleteGroup("1")).thenReturn(true);

        ResponseEntity<BaseResponse<Void>> response = groupController.deleteGroup("1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        verify(groupService, times(1)).deleteGroup("1");
    }

    @Test
    void deleteGroup_NonExistingGroup_ReturnsNotFound() {
        when(groupService.deleteGroup("999")).thenReturn(false);

        ResponseEntity<BaseResponse<Void>> response = groupController.deleteGroup("999");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        verify(groupService, times(1)).deleteGroup("999");
    }
}