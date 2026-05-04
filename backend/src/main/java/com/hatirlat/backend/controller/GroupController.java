package com.hatirlat.backend.controller;

import com.hatirlat.backend.dto.*;
import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.service.AuditLogService;
import com.hatirlat.backend.service.GroupService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
@Tag(name = "Groups", description = "Group management endpoints")
public class GroupController {

    private final GroupService groupService;

    @Autowired
    private AuditLogService auditLogService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @Operation(summary = "Get all groups", description = "Retrieve all groups for the authenticated user")
    @GetMapping
    public ResponseEntity<BaseResponse<List<GroupResponse>>> getAllGroups(
            @AuthenticationPrincipal User currentUser) {
        List<GroupResponse> groups = groupService.getAllGroups(currentUser);
        String message = groups.isEmpty() ? "No groups found" : "Groups retrieved successfully";
        return ResponseEntity.ok(new BaseResponse<>(true, groups, message));
    }

    @Operation(summary = "Get group by ID")
    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse<GroupResponse>> getGroupById(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser) {
        GroupResponse group = groupService.getGroupById(id, currentUser);
        return ResponseEntity.ok(new BaseResponse<>(true, group, "Group retrieved successfully"));
    }

    @Operation(summary = "Create a new group")
    @PostMapping
    public ResponseEntity<BaseResponse<GroupResponse>> createGroup(
            @Valid @RequestBody GroupRequest request,
            @AuthenticationPrincipal User currentUser,
            HttpServletRequest httpRequest) {
        GroupResponse createdGroup = groupService.createGroup(request, currentUser);
        auditLogService.logAction(currentUser, "GROUP_CREATED", "Group",
                Long.valueOf(createdGroup.getId()),
                Map.of("groupName", createdGroup.getName(),
                       "owner", currentUser.getUsername()),
                httpRequest);
        return ResponseEntity.ok(new BaseResponse<>(true, createdGroup, "Group created successfully"));
    }

    @Operation(summary = "Update a group")
    @PutMapping("/{id}")
    public ResponseEntity<BaseResponse<GroupResponse>> updateGroup(
            @PathVariable String id,
            @Valid @RequestBody GroupRequest request,
            @AuthenticationPrincipal User currentUser,
            HttpServletRequest httpRequest) {
        GroupResponse updatedGroup = groupService.updateGroup(id, request, currentUser);
        auditLogService.logAction(currentUser, "GROUP_UPDATED", "Group",
                Long.valueOf(id),
                Map.of("groupName", updatedGroup.getName()),
                httpRequest);
        return ResponseEntity.ok(new BaseResponse<>(true, updatedGroup, "Group updated successfully"));
    }

    @Operation(summary = "Delete a group")
    @DeleteMapping("/{id}")
    public ResponseEntity<BaseResponse<Void>> deleteGroup(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser,
            HttpServletRequest httpRequest) {
        // Fetch name before deletion for the log
        GroupResponse group = groupService.getGroupById(id, currentUser);
        groupService.deleteGroup(id, currentUser);
        auditLogService.logAction(currentUser, "GROUP_DELETED", "Group",
                Long.valueOf(id),
                Map.of("groupName", group.getName()),
                httpRequest);
        return ResponseEntity.ok(new BaseResponse<>(true, null, "Group deleted successfully"));
    }
}
