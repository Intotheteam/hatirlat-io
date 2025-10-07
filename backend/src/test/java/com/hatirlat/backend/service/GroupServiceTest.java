package com.hatirlat.backend.service;

import com.hatirlat.backend.dto.GroupRequest;
import com.hatirlat.backend.dto.GroupResponse;
import com.hatirlat.backend.entity.Group;
import com.hatirlat.backend.entity.Member;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GroupServiceTest {

    @Mock
    private GroupRepository groupRepository;
    
    @Mock
    private MemberRepository memberRepository;

    @InjectMocks
    private GroupService groupService;

    private GroupRequest groupRequest;
    private Group group;

    @BeforeEach
    void setUp() {
        groupRequest = new GroupRequest();
        groupRequest.setName("Test Group");
        groupRequest.setDescription("Test Description");

        group = new Group();
        group.setId(1L);
        group.setName("Test Group");
        group.setDescription("Test Description");
        group.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void getAllGroups_ReturnsListOfGroups() {
        when(groupRepository.findAll()).thenReturn(Arrays.asList(group));

        List<GroupResponse> groups = groupService.getAllGroups();

        assertEquals(1, groups.size());
        assertEquals("Test Group", groups.get(0).getName());
        verify(groupRepository, times(1)).findAll();
    }

    @Test
    void getGroupById_ExistingGroup_ReturnsGroup() {
        when(groupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(memberRepository.findMembersByGroupId(1L)).thenReturn(Arrays.asList());

        GroupResponse response = groupService.getGroupById("1");

        assertNotNull(response);
        assertEquals("Test Group", response.getName());
        verify(groupRepository, times(1)).findById(1L);
        verify(memberRepository, times(1)).findMembersByGroupId(1L);
    }

    @Test
    void getGroupById_NonExistingGroup_ReturnsNull() {
        when(groupRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(com.hatirlat.backend.exception.ResourceNotFoundException.class, () -> {
            groupService.getGroupById("999");
        });
        
        verify(groupRepository, times(1)).findById(999L);
    }

    @Test
    void createGroup_ValidRequest_ReturnsCreatedGroup() {
        when(groupRepository.save(any(Group.class))).thenReturn(group);
        when(memberRepository.findMembersByGroupId(1L)).thenReturn(Arrays.asList());

        GroupResponse response = groupService.createGroup(groupRequest);

        assertNotNull(response);
        assertEquals("Test Group", response.getName());
        verify(groupRepository, times(1)).save(any(Group.class));
        verify(memberRepository, times(1)).findMembersByGroupId(1L);
    }

    @Test
    void updateGroup_ExistingGroup_ReturnsUpdatedGroup() {
        groupRequest.setName("Updated Group");
        when(groupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(groupRepository.save(any(Group.class))).thenReturn(group);
        when(memberRepository.findMembersByGroupId(1L)).thenReturn(Arrays.asList());

        GroupResponse response = groupService.updateGroup("1", groupRequest);

        assertNotNull(response);
        assertEquals("Updated Group", response.getName());
        verify(groupRepository, times(1)).findById(1L);
        verify(groupRepository, times(1)).save(any(Group.class));
        verify(memberRepository, times(1)).findMembersByGroupId(1L);
    }

    @Test
    void updateGroup_NonExistingGroup_ReturnsNull() {
        when(groupRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(com.hatirlat.backend.exception.ResourceNotFoundException.class, () -> {
            groupService.updateGroup("999", groupRequest);
        });
        
        verify(groupRepository, times(1)).findById(999L);
    }

    @Test
    void deleteGroup_ExistingGroup_ReturnsTrue() {
        when(groupRepository.existsById(1L)).thenReturn(true);

        boolean result = groupService.deleteGroup("1");

        assertTrue(result);
        verify(groupRepository, times(1)).existsById(1L);
        verify(groupRepository, times(1)).deleteById(1L);
    }

    @Test
    void deleteGroup_NonExistingGroup_ReturnsFalse() {
        when(groupRepository.existsById(999L)).thenReturn(false);

        assertThrows(com.hatirlat.backend.exception.ResourceNotFoundException.class, () -> {
            groupService.deleteGroup("999");
        });
        
        verify(groupRepository, times(1)).existsById(999L);
        verify(groupRepository, never()).deleteById(999L);
    }
}