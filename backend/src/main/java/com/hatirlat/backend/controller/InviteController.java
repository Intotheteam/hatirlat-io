package com.hatirlat.backend.controller;

import com.hatirlat.backend.dto.*;
import com.hatirlat.backend.service.GroupService;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/invite")
@Tag(name = "Invites", description = "Public invite endpoints (no auth required)")
public class InviteController {

    private final GroupService groupService;

    public InviteController(GroupService groupService) {
        this.groupService = groupService;
    }

    @Operation(summary = "Validate invite code", description = "Get group information by invite code")
    @GetMapping("/{code}")
    public ResponseEntity<BaseResponse<GroupResponse>> validateInviteCode(@PathVariable String code) {
        GroupResponse group = groupService.getGroupByInviteCode(code);
        return ResponseEntity.ok(new BaseResponse<>(true, group, "Invite code is valid"));
    }

    @Operation(summary = "Join group via invite", description = "Join a group using an invite code")
    @PostMapping("/{code}/join")
    public ResponseEntity<BaseResponse<Void>> joinGroup(
            @PathVariable String code,
            @Valid @RequestBody JoinGroupRequest request) {
        groupService.joinGroupByInviteCode(code, request.getName(), request.getEmail(), request.getPhone());
        return ResponseEntity.ok(new BaseResponse<>(true, null, "Successfully joined the group"));
    }
}
