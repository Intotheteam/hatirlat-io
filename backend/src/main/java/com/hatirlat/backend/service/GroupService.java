package com.hatirlat.backend.service;

import com.hatirlat.backend.dto.GroupRequest;
import com.hatirlat.backend.dto.GroupResponse;
import com.hatirlat.backend.entity.*;
import com.hatirlat.backend.exception.ResourceNotFoundException;
import com.hatirlat.backend.mapper.GroupMapper;
import com.hatirlat.backend.repository.GroupMemberRepository;
import com.hatirlat.backend.repository.GroupRepository;
import com.hatirlat.backend.repository.MemberRepository;
import com.hatirlat.backend.repository.ReminderRepository;
import com.hatirlat.backend.util.LoggingUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GroupService {

    private static final Logger logger = LoggerFactory.getLogger(GroupService.class);

    private final GroupRepository groupRepository;
    private final MemberRepository memberRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final ReminderRepository reminderRepository;
    private final GroupMapper groupMapper;
    private final LoggingUtil loggingUtil;

    public GroupService(GroupRepository groupRepository, MemberRepository memberRepository,
            GroupMemberRepository groupMemberRepository, ReminderRepository reminderRepository, GroupMapper groupMapper,
            LoggingUtil loggingUtil) {
        this.groupRepository = groupRepository;
        this.memberRepository = memberRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.reminderRepository = reminderRepository;
        this.groupMapper = groupMapper;
        this.loggingUtil = loggingUtil;
    }

    @Transactional(readOnly = true)
    public List<GroupResponse> getAllGroups(User currentUser) {
        loggingUtil.logServiceMethodEntry(this.getClass().getSimpleName(), "getAllGroups");
        try {
            List<Group> groups = groupRepository.findByOwner(currentUser);
            List<GroupResponse> responses = groups.stream().map(groupMapper::toDto).collect(Collectors.toList());
            loggingUtil.logServiceMethodExit(this.getClass().getSimpleName(), "getAllGroups",
                    responses.size() + " groups retrieved");
            return responses;
        } catch (Exception e) {
            loggingUtil.logServiceMethodError(this.getClass().getSimpleName(), "getAllGroups", e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public GroupResponse getGroupById(String id, User currentUser) {
        loggingUtil.logServiceMethodEntry(this.getClass().getSimpleName(), "getGroupById", id);
        try {
            Group group = groupRepository.findById(Long.parseLong(id))
                    .orElseThrow(() -> new ResourceNotFoundException("Group", id));
            verifyOwnership(group, currentUser);
            GroupResponse response = groupMapper.toDto(group);
            loggingUtil.logServiceMethodExit(this.getClass().getSimpleName(), "getGroupById", id);
            return response;
        } catch (Exception e) {
            loggingUtil.logServiceMethodError(this.getClass().getSimpleName(), "getGroupById", e);
            throw e;
        }
    }

    @Transactional
    public GroupResponse createGroup(GroupRequest request, User currentUser) {
        loggingUtil.logServiceMethodEntry(this.getClass().getSimpleName(), "createGroup", request.getName());
        try {
            Group group = new Group(request.getName(), request.getDescription());
            group.setOwner(currentUser);
            group.setInviteCode(generateInviteCode());
            Group savedGroup = groupRepository.save(group);
            loggingUtil.logDatabaseOperation("CREATE", "Group", savedGroup.getId());
            GroupResponse response = groupMapper.toDto(savedGroup);
            loggingUtil.logServiceMethodExit(this.getClass().getSimpleName(), "createGroup", response.getId());
            return response;
        } catch (Exception e) {
            loggingUtil.logServiceMethodError(this.getClass().getSimpleName(), "createGroup", e);
            throw e;
        }
    }

    @Transactional
    public GroupResponse updateGroup(String id, GroupRequest request, User currentUser) {
        loggingUtil.logServiceMethodEntry(this.getClass().getSimpleName(), "updateGroup", id);
        try {
            Group existingGroup = groupRepository.findById(Long.parseLong(id))
                    .orElseThrow(() -> new ResourceNotFoundException("Group", id));
            verifyOwnership(existingGroup, currentUser);

            existingGroup.setName(request.getName());
            existingGroup.setDescription(request.getDescription());

            Group updatedGroup = groupRepository.save(existingGroup);
            loggingUtil.logDatabaseOperation("UPDATE", "Group", updatedGroup.getId());
            GroupResponse response = groupMapper.toDto(updatedGroup);
            loggingUtil.logServiceMethodExit(this.getClass().getSimpleName(), "updateGroup", response.getId());
            return response;
        } catch (Exception e) {
            loggingUtil.logServiceMethodError(this.getClass().getSimpleName(), "updateGroup", e);
            throw e;
        }
    }

    @Transactional
    public boolean deleteGroup(String id, User currentUser) {
        loggingUtil.logServiceMethodEntry(this.getClass().getSimpleName(), "deleteGroup", id);
        try {
            Group group = groupRepository.findById(Long.parseLong(id))
                    .orElseThrow(() -> new ResourceNotFoundException("Group", id));
            verifyOwnership(group, currentUser);

            // Delete associated entities to prevent foreign key constraint violations
            reminderRepository.deleteByGroup(group);
            groupMemberRepository.deleteByGroupId(group.getId());

            groupRepository.deleteById(Long.parseLong(id));
            loggingUtil.logDatabaseOperation("DELETE", "Group", id);
            loggingUtil.logServiceMethodExit(this.getClass().getSimpleName(), "deleteGroup", true);
            return true;
        } catch (Exception e) {
            loggingUtil.logServiceMethodError(this.getClass().getSimpleName(), "deleteGroup", e);
            throw e;
        }
    }

    /**
     * Get group info by invite code (public - no auth needed).
     */
    @Transactional(readOnly = true)
    public GroupResponse getGroupByInviteCode(String inviteCode) {
        Group group = groupRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new ResourceNotFoundException("Group invite", inviteCode));
        return groupMapper.toDto(group);
    }

    /**
     * Join a group using an invite code.
     */
    @Transactional
    public void joinGroupByInviteCode(String inviteCode, String memberName, String memberEmail, String memberPhone) {
        Group group = groupRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new ResourceNotFoundException("Group invite", inviteCode));

        // Create a new member
        Member member = new Member(memberName, memberEmail, memberPhone);
        member.setRole(MemberRole.MEMBER);
        member.setStatus(MemberStatus.ACTIVE);
        Member savedMember = memberRepository.save(member);

        // Create GroupMember association
        GroupMember groupMember = new GroupMember(group.getId(), savedMember.getId());
        groupMemberRepository.save(groupMember);

        logger.info("Member '{}' joined group '{}' via invite code", memberName, group.getName());
    }

    private String generateInviteCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase(java.util.Locale.ENGLISH);
    }

    private void verifyOwnership(Group group, User currentUser) {
        if (group.getOwner() != null && !group.getOwner().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to access this group");
        }
    }
}
