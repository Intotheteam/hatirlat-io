package com.hatirlat.backend.controller;

import com.hatirlat.backend.dto.*;
import com.hatirlat.backend.service.MemberService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Members", description = "Member management endpoints")
public class MemberController {

        private final MemberService memberService;

        public MemberController(MemberService memberService) {
                this.memberService = memberService;
        }

        @Operation(summary = "Get all members in a group", description = "Retrieve all members of a specific group", responses = {
                        @ApiResponse(responseCode = "200", description = "Successfully retrieved members", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MemberResponse.class)))
        })
        @GetMapping("/groups/{groupId}/members")
        public ResponseEntity<BaseResponse<List<MemberResponse>>> getGroupMembers(@PathVariable String groupId) {
                List<MemberResponse> members = memberService.getGroupMembers(groupId);
                String message = members.isEmpty()
                                ? "No members found in the group"
                                : "Members retrieved successfully";
                return ResponseEntity.ok(new BaseResponse<>(true, members, message));
        }

        @Operation(summary = "Add member to group", description = "Add a new member to a group", responses = {
                        @ApiResponse(responseCode = "200", description = "Successfully added member to group", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MemberResponse.class))),
                        @ApiResponse(responseCode = "400", description = "Invalid request data")
        })
        @PostMapping("/groups/{groupId}/members")
        public ResponseEntity<BaseResponse<MemberResponse>> addMemberToGroup(@PathVariable String groupId,
                        @Valid @RequestBody MemberRequest request, HttpServletRequest servletRequest) {
                String ipAddress = servletRequest.getRemoteAddr();
                MemberResponse member = memberService.addMemberToGroup(groupId, request, ipAddress);
                return ResponseEntity.ok(new BaseResponse<>(true, member, "Member added to group successfully"));
        }

        @Operation(summary = "Update member in group", description = "Update a member's information within a group", responses = {
                        @ApiResponse(responseCode = "200", description = "Successfully updated member", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MemberResponse.class))),
                        @ApiResponse(responseCode = "404", description = "Member or group not found")
        })
        @PutMapping("/groups/{groupId}/members/{memberId}")
        public ResponseEntity<BaseResponse<MemberResponse>> updateMember(
                        @PathVariable String groupId,
                        @PathVariable String memberId,
                        @Valid @RequestBody MemberRequest request) {
                MemberResponse member = memberService.updateMember(groupId, memberId, request);
                return ResponseEntity.ok(new BaseResponse<>(true, member, "Member updated successfully"));
        }

        @Operation(summary = "Remove member from group", description = "Remove a member from a group", responses = {
                        @ApiResponse(responseCode = "204", description = "Successfully removed member from group")
        })
        @DeleteMapping("/groups/{groupId}/members/{memberId}")
        public ResponseEntity<BaseResponse<Void>> removeMemberFromGroup(@PathVariable String groupId,
                        @PathVariable String memberId) {
                boolean removed = memberService.removeMemberFromGroup(groupId, memberId);
                if (removed) {
                        return ResponseEntity
                                        .ok(new BaseResponse<>(true, null, "Member removed from group successfully"));
                } else {
                        return ResponseEntity.ok(new BaseResponse<>(false, null, "Member or group not found"));
                }
        }

        @Operation(summary = "Toggle member status in group", description = "Toggle a member's status between ACTIVE and INACTIVE", responses = {
                        @ApiResponse(responseCode = "200", description = "Successfully toggled member status", content = @Content(mediaType = "application/json", schema = @Schema(implementation = MemberResponse.class))),
                        @ApiResponse(responseCode = "404", description = "Member or group not found")
        })
        @PatchMapping("/groups/{groupId}/members/{memberId}/status")
        public ResponseEntity<BaseResponse<MemberResponse>> toggleMemberStatus(
                        @PathVariable String groupId,
                        @PathVariable String memberId) {
                MemberResponse member = memberService.toggleMemberStatus(groupId, memberId);
                return ResponseEntity.ok(new BaseResponse<>(true, member, "Member status toggled successfully"));
        }

        @Operation(summary = "Invite member to group", description = "Send an invitation to join a group", responses = {
                        @ApiResponse(responseCode = "200", description = "Successfully sent invitation")
        })
        @PostMapping("/members/invite")
        public ResponseEntity<BaseResponse<String>> inviteMember(@Valid @RequestBody InviteRequest request,
                        HttpServletRequest servletRequest) {
                String ipAddress = servletRequest.getRemoteAddr();
                String result = memberService.inviteMember(request.getEmail(), request.getGroupId(), ipAddress);
                return ResponseEntity.ok(new BaseResponse<>(true, result, "Invitation sent successfully"));
        }
}