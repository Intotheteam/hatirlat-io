package com.hatirlat.backend.controller;

import com.hatirlat.backend.dto.*;
import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.service.GroupService;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@Tag(name = "Groups", description = "Group management endpoints")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @Operation(
            summary = "Get all groups",
            description = "Retrieve all groups for the authenticated user",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Successfully retrieved groups",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = GroupResponse.class))
                    )
            }
    )
    @GetMapping
    public ResponseEntity<BaseResponse<List<GroupResponse>>> getAllGroups(
            @AuthenticationPrincipal User currentUser) {
        List<GroupResponse> groups = groupService.getAllGroups(currentUser);
        String message = groups.isEmpty()
            ? "No groups found"
            : "Groups retrieved successfully";
        return ResponseEntity.ok(new BaseResponse<>(true, groups, message));
    }

    @Operation(
            summary = "Get group by ID",
            description = "Retrieve a specific group by its ID",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Successfully retrieved group",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = GroupResponse.class))
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Group not found"
                    )
            }
    )
    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse<GroupResponse>> getGroupById(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser) {
        GroupResponse group = groupService.getGroupById(id, currentUser);
        return ResponseEntity.ok(new BaseResponse<>(true, group, "Group retrieved successfully"));
    }

    @Operation(
            summary = "Create a new group",
            description = "Create a new group",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Successfully created group",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = GroupResponse.class))
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Invalid request data"
                    )
            }
    )
    @PostMapping
    public ResponseEntity<BaseResponse<GroupResponse>> createGroup(
            @Valid @RequestBody GroupRequest request,
            @AuthenticationPrincipal User currentUser) {
        GroupResponse createdGroup = groupService.createGroup(request, currentUser);
        return ResponseEntity.ok(new BaseResponse<>(true, createdGroup, "Group created successfully"));
    }

    @Operation(
            summary = "Update a group",
            description = "Update an existing group",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Successfully updated group",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = GroupResponse.class))
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Group not found"
                    )
            }
    )
    @PutMapping("/{id}")
    public ResponseEntity<BaseResponse<GroupResponse>> updateGroup(
            @PathVariable String id,
            @Valid @RequestBody GroupRequest request,
            @AuthenticationPrincipal User currentUser) {
        GroupResponse updatedGroup = groupService.updateGroup(id, request, currentUser);
        return ResponseEntity.ok(new BaseResponse<>(true, updatedGroup, "Group updated successfully"));
    }

    @Operation(
            summary = "Delete a group",
            description = "Delete a group by its ID",
            responses = {
                    @ApiResponse(
                            responseCode = "204",
                            description = "Successfully deleted group"
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Group not found"
                    )
            }
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<BaseResponse<Void>> deleteGroup(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser) {
        groupService.deleteGroup(id, currentUser);
        return ResponseEntity.ok(new BaseResponse<>(true, null, "Group deleted successfully"));
    }
}
