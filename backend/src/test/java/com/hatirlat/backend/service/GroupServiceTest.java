package com.hatirlat.backend.service;

import com.hatirlat.backend.dto.GroupRequest;
import com.hatirlat.backend.dto.GroupResponse;
import com.hatirlat.backend.entity.Group;
import com.hatirlat.backend.exception.ResourceNotFoundException;
import com.hatirlat.backend.mapper.GroupMapper;
import com.hatirlat.backend.repository.GroupRepository;
import com.hatirlat.backend.repository.MemberRepository;
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
class GroupServiceTest {

    @Mock
    private GroupRepository groupRepository;
    
    @Mock
    private MemberRepository memberRepository;
    
    @Mock
    private GroupMapper groupMapper;
    
    @Mock
    private LoggingUtil loggingUtil;
    
    @InjectMocks
    private GroupService groupService;

    private Group group;
    private GroupResponse groupResponse;
    private GroupRequest groupRequest;

    @BeforeEach
    void setUp() {
        group = new Group();
        group.setId(1L);
        group.setName("Test Group");
        group.setDescription("Test Description");
        group.setCreatedAt(LocalDateTime.now());

        groupResponse = new GroupResponse();
        groupResponse.setId("1");
        groupResponse.setName("Test Group");
        groupResponse.setDescription("Test Description");

        groupRequest = new GroupRequest();
        groupRequest.setName("Test Group");
        groupRequest.setDescription("Test Description");
    }

    @Test
    void testGetAllGroups() {
        // Given
        when(groupRepository.findAll()).thenReturn(Arrays.asList(group));
        when(groupMapper.toDto(group)).thenReturn(groupResponse);

        // When
        List<GroupResponse> result = groupService.getAllGroups();

        // Then
        assertEquals(1, result.size());
        assertEquals("Test Group", result.get(0).getName());
        verify(groupRepository, times(1)).findAll();
        verify(groupMapper, times(1)).toDto(group);
    }

    @Test
    void testGetGroupById() {
        // Given
        when(groupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(groupMapper.toDto(group)).thenReturn(groupResponse);

        // When
        GroupResponse result = groupService.getGroupById("1");

        // Then
        assertEquals("1", result.getId());
        assertEquals("Test Group", result.getName());
        verify(groupRepository, times(1)).findById(1L);
    }

    @Test
    void testGetGroupById_NotFound() {
        // Given
        when(groupRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            groupService.getGroupById("1");
        });
        verify(groupRepository, times(1)).findById(1L);
    }

    @Test
    void testCreateGroup() {
        // Given
        when(groupRepository.save(any(Group.class))).thenReturn(group);
        when(groupMapper.toDto(any(Group.class))).thenReturn(groupResponse);

        // When
        GroupResponse result = groupService.createGroup(groupRequest);

        // Then
        assertEquals("1", result.getId());
        verify(groupRepository, times(1)).save(any(Group.class));
    }

    @Test
    void testUpdateGroup() {
        // Given
        when(groupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(groupRepository.save(any(Group.class))).thenReturn(group);
        when(groupMapper.toDto(any(Group.class))).thenReturn(groupResponse);

        // When
        GroupResponse result = groupService.updateGroup("1", groupRequest);

        // Then
        assertEquals("1", result.getId());
        verify(groupRepository, times(1)).findById(1L);
        verify(groupRepository, times(1)).save(any(Group.class));
    }

    @Test
    void testUpdateGroup_NotFound() {
        // Given
        when(groupRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            groupService.updateGroup("1", groupRequest);
        });
        verify(groupRepository, times(1)).findById(1L);
    }

    @Test
    void testDeleteGroup() {
        // Given
        when(groupRepository.existsById(1L)).thenReturn(true);

        // When
        boolean result = groupService.deleteGroup("1");

        // Then
        assertTrue(result);
        verify(groupRepository, times(1)).deleteById(1L);
    }

    @Test
    void testDeleteGroup_NotFound() {
        // Given
        when(groupRepository.existsById(1L)).thenReturn(false);

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> {
            groupService.deleteGroup("1");
        });
        verify(groupRepository, times(1)).existsById(1L);
    }
}