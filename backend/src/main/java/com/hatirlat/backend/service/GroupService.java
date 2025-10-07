package com.hatirlat.backend.service;

import com.hatirlat.backend.dto.GroupRequest;
import com.hatirlat.backend.dto.GroupResponse;
import com.hatirlat.backend.entity.Group;
import com.hatirlat.backend.entity.Member;
import com.hatirlat.backend.exception.ResourceNotFoundException;
import com.hatirlat.backend.repository.GroupRepository;
import com.hatirlat.backend.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;
    
    @Autowired
    private MemberRepository memberRepository;

    @Transactional(readOnly = true)
    public List<GroupResponse> getAllGroups() {
        // In a real implementation, you'd filter by the authenticated user
        List<Group> groups = groupRepository.findAll();
        return groups.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GroupResponse getGroupById(String id) {
        return groupRepository.findById(Long.parseLong(id))
                .map(this::convertToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Group", id));
    }

    @Transactional
    public GroupResponse createGroup(GroupRequest request) {
        Group group = new Group();
        group.setName(request.getName());
        group.setDescription(request.getDescription());
        Group savedGroup = groupRepository.save(group);
        return convertToResponse(savedGroup);
    }

    @Transactional
    public GroupResponse updateGroup(String id, GroupRequest request) {
        Group existingGroup = groupRepository.findById(Long.parseLong(id))
                .orElseThrow(() -> new ResourceNotFoundException("Group", id));

        existingGroup.setName(request.getName());
        existingGroup.setDescription(request.getDescription());

        Group updatedGroup = groupRepository.save(existingGroup);
        return convertToResponse(updatedGroup);
    }

    @Transactional
    public boolean deleteGroup(String id) {
        if (!groupRepository.existsById(Long.parseLong(id))) {
            throw new ResourceNotFoundException("Group", id);
        }
        groupRepository.deleteById(Long.parseLong(id));
        return true;
    }

    private GroupResponse convertToResponse(Group group) {
        GroupResponse response = new GroupResponse();
        response.setId(String.valueOf(group.getId()));
        response.setName(group.getName());
        response.setDescription(group.getDescription());
        // Count members by querying the GroupMember repository
        List<Member> members = memberRepository.findMembersByGroupId(group.getId());
        response.setMemberCount(members != null ? members.size() : 0);
        response.setCreatedAt(group.getCreatedAt());
        return response;
    }
}