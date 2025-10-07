package com.hatirlat.backend.controller;

import com.hatirlat.backend.dto.*;
import com.hatirlat.backend.service.MemberService;
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
class MemberControllerTest {

    @Mock
    private MemberService memberService;

    @InjectMocks
    private MemberController memberController;

    private MemberRequest memberRequest;
    private MemberResponse memberResponse;

    @BeforeEach
    void setUp() {
        memberRequest = new MemberRequest();
        memberRequest.setName("Test Member");
        memberRequest.setEmail("test@example.com");
        memberRequest.setPhone("1234567890");
        memberRequest.setRole("member");

        memberResponse = new MemberResponse();
        memberResponse.setId("1");
        memberResponse.setName("Test Member");
        memberResponse.setEmail("test@example.com");
        memberResponse.setPhone("1234567890");
        memberResponse.setRole("member");
        memberResponse.setStatus("pending");
        memberResponse.setJoinedAt(LocalDateTime.now());
    }

    @Test
    void getGroupMembers_ReturnsListOfMembers() {
        List<MemberResponse> members = Arrays.asList(memberResponse);
        when(memberService.getGroupMembers("1")).thenReturn(members);

        ResponseEntity<BaseResponse<List<MemberResponse>>> response = memberController.getGroupMembers("1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals(1, response.getBody().getData().size());
        assertEquals("Test Member", response.getBody().getData().get(0).getName());
        verify(memberService, times(1)).getGroupMembers("1");
    }

    @Test
    void addMemberToGroup_ValidRequest_ReturnsMember() {
        when(memberService.addMemberToGroup(eq("1"), any(MemberRequest.class))).thenReturn(memberResponse);

        ResponseEntity<BaseResponse<MemberResponse>> response = memberController.addMemberToGroup("1", memberRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Test Member", response.getBody().getData().getName());
        verify(memberService, times(1)).addMemberToGroup(eq("1"), any(MemberRequest.class));
    }

    @Test
    void removeMemberFromGroup_ExistingMember_ReturnsSuccess() {
        when(memberService.removeMemberFromGroup("1", "1")).thenReturn(true);

        ResponseEntity<BaseResponse<Void>> response = memberController.removeMemberFromGroup("1", "1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Member removed from group successfully", response.getBody().getMessage());
        verify(memberService, times(1)).removeMemberFromGroup("1", "1");
    }

    @Test
    void removeMemberFromGroup_NonExistingMember_ReturnsNotFound() {
        when(memberService.removeMemberFromGroup("1", "999")).thenReturn(false);

        ResponseEntity<BaseResponse<Void>> response = memberController.removeMemberFromGroup("1", "999");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Member or group not found", response.getBody().getMessage());
        verify(memberService, times(1)).removeMemberFromGroup("1", "999");
    }

    @Test
    void inviteMember_ValidRequest_ReturnsSuccess() {
        String expectedMessage = "Invitation sent to test@example.com for group 1";
        when(memberService.inviteMember("test@example.com", "1")).thenReturn(expectedMessage);

        InviteRequest inviteRequest = new InviteRequest();
        inviteRequest.setEmail("test@example.com");
        inviteRequest.setGroupId("1");

        ResponseEntity<BaseResponse<String>> response = memberController.inviteMember(inviteRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals(expectedMessage, response.getBody().getData());
        verify(memberService, times(1)).inviteMember("test@example.com", "1");
    }
}