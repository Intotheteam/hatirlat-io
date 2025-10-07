package com.hatirlat.backend.service;

import com.hatirlat.backend.dto.MemberRequest;
import com.hatirlat.backend.dto.MemberResponse;
import com.hatirlat.backend.entity.*;
import com.hatirlat.backend.repository.GroupRepository;
import com.hatirlat.backend.repository.MemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MemberServiceTest {

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private GroupRepository groupRepository;

    @InjectMocks
    private MemberService memberService;

    private MemberRequest memberRequest;
    private Member member;
    private Group group;

    @BeforeEach
    void setUp() {
        memberRequest = new MemberRequest();
        memberRequest.setName("Test Member");
        memberRequest.setEmail("test@example.com");
        memberRequest.setPhone("1234567890");
        memberRequest.setRole("member");

        member = new Member();
        member.setId(1L);
        member.setName("Test Member");
        member.setEmail("test@example.com");
        member.setPhone("1234567890");
        member.setRole(MemberRole.MEMBER);
        member.setStatus(MemberStatus.PENDING);
        member.setJoinedAt(LocalDateTime.now());

        group = new Group();
        group.setId(1L);
        group.setName("Test Group");
        group.setMembers(new HashSet<>());
    }

    @Test
    void getGroupMembers_ExistingGroupWithMembers_ReturnsListOfMembers() {
        group.getMembers().add(member);
        when(groupRepository.findById(1L)).thenReturn(Optional.of(group));

        List<MemberResponse> members = memberService.getGroupMembers("1");

        assertEquals(1, members.size());
        assertEquals("Test Member", members.get(0).getName());
        verify(groupRepository, times(1)).findById(1L);
    }

    @Test
    void getGroupMembers_NonExistingGroup_ReturnsEmptyList() {
        when(groupRepository.findById(999L)).thenReturn(Optional.empty());

        List<MemberResponse> members = memberService.getGroupMembers("999");

        assertTrue(members.isEmpty());
        verify(groupRepository, times(1)).findById(999L);
    }

    @Test
    void addMemberToGroup_ValidRequest_ReturnsAddedMember() {
        when(groupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(memberRepository.save(any(Member.class))).thenReturn(member);

        MemberResponse response = memberService.addMemberToGroup("1", memberRequest);

        assertNotNull(response);
        assertEquals("Test Member", response.getName());
        verify(groupRepository, times(1)).findById(1L);
        verify(memberRepository, times(1)).save(any(Member.class));
        assertEquals(1, group.getMembers().size());
    }

    @Test
    void addMemberToGroup_NonExistingGroup_ReturnsNull() {
        when(groupRepository.findById(999L)).thenReturn(Optional.empty());

        MemberResponse response = memberService.addMemberToGroup("999", memberRequest);

        assertNull(response);
        verify(groupRepository, times(1)).findById(999L);
        verify(memberRepository, never()).save(any(Member.class));
    }

    @Test
    void removeMemberFromGroup_ExistingMember_ReturnsTrue() {
        group.getMembers().add(member);
        when(groupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(memberRepository.findById(1L)).thenReturn(Optional.of(member));

        boolean result = memberService.removeMemberFromGroup("1", "1");

        assertTrue(result);
        verify(groupRepository, times(1)).findById(1L);
        verify(memberRepository, times(1)).findById(1L);
        verify(groupRepository, times(1)).save(any(Group.class));
    }

    @Test
    void removeMemberFromGroup_NonExistingGroup_ReturnsFalse() {
        when(groupRepository.findById(999L)).thenReturn(Optional.empty());

        boolean result = memberService.removeMemberFromGroup("999", "1");

        assertFalse(result);
        verify(groupRepository, times(1)).findById(999L);
        verify(memberRepository, never()).findById(anyLong());
        verify(groupRepository, never()).save(any(Group.class));
    }

    @Test
    void removeMemberFromGroup_NonExistingMember_ReturnsFalse() {
        when(groupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(memberRepository.findById(999L)).thenReturn(Optional.empty());

        boolean result = memberService.removeMemberFromGroup("1", "999");

        assertFalse(result);
        verify(groupRepository, times(1)).findById(1L);
        verify(memberRepository, times(1)).findById(999L);
        verify(groupRepository, never()).save(any(Group.class));
    }

    @Test
    void inviteMember_ValidRequest_ReturnsSuccessMessage() {
        String result = memberService.inviteMember("test@example.com", "1");

        assertTrue(result.startsWith("Invitation sent to test@example.com for group 1"));
    }
}