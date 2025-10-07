package com.hatirlat.backend.controller;

import com.hatirlat.backend.dto.*;
import com.hatirlat.backend.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Members", description = "Member management endpoints")
public class MemberController {

    @Autowired
    private MemberService memberService;

    @Operation(
            summary = "Get all members in a group",
            description = "Retrieve all members of a specific group",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Successfully retrieved members",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = MemberResponse.class))
                    )
            }
    )
    @GetMapping("/groups/{groupId}/members")
    public ResponseEntity<BaseResponse<List<MemberResponse>>> getGroupMembers(@PathVariable String groupId) {
        List<MemberResponse> members = memberService.getGroupMembers(groupId);
        return ResponseEntity.ok(new BaseResponse<>(true, members, "Members retrieved successfully"));
    }

    @Operation(
            summary = "Add member to group",
            description = "Add a new member to a group",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Successfully added member to group",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = MemberResponse.class))
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Invalid request data"
                    )
            }
    )
    @PostMapping("/groups/{groupId}/members")
    public ResponseEntity<BaseResponse<MemberResponse>> addMemberToGroup(@PathVariable String groupId, @RequestBody MemberRequest request) {
        MemberResponse member = memberService.addMemberToGroup(groupId, request);
        return ResponseEntity.ok(new BaseResponse<>(true, member, "Member added to group successfully"));
    }

    @Operation(
            summary = "Remove member from group",
            description = "Remove a member from a group",
            responses = {
                    @ApiResponse(
                            responseCode = "204",
                            description = "Successfully removed member from group"
                    )
            }
    )
    @DeleteMapping("/groups/{groupId}/members/{memberId}")
    public ResponseEntity<BaseResponse<Void>> removeMemberFromGroup(@PathVariable String groupId, @PathVariable String memberId) {
        boolean removed = memberService.removeMemberFromGroup(groupId, memberId);
        if (removed) {
            return ResponseEntity.ok(new BaseResponse<>(true, null, "Member removed from group successfully"));
        } else {
            return ResponseEntity.ok(new BaseResponse<>(false, null, "Member or group not found"));
        }
    }

    @Operation(
            summary = "Invite member to group",
            description = "Send an invitation to join a group",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Successfully sent invitation"
                    )
            }
    )
    @PostMapping("/members/invite")
    public ResponseEntity<BaseResponse<String>> inviteMember(@RequestBody InviteRequest request) {
        String result = memberService.inviteMember(request.getEmail(), request.getGroupId());
        return ResponseEntity.ok(new BaseResponse<>(true, result, "Invitation sent successfully"));
    }
}