package com.hatirlat.backend.controller;

import com.hatirlat.backend.dto.*;
import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.service.UserProfileService;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@Tag(name = "User Profile", description = "User profile management endpoints")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @Operation(summary = "Get user profile", description = "Get the current user's profile information")
    @GetMapping
    public ResponseEntity<BaseResponse<UserResponse>> getProfile(
            @AuthenticationPrincipal User currentUser) {
        UserResponse profile = userProfileService.getUserProfile(currentUser);
        return ResponseEntity.ok(new BaseResponse<>(true, profile, "Profile retrieved successfully"));
    }

    @Operation(summary = "Update user profile", description = "Update the current user's profile information")
    @PutMapping
    public ResponseEntity<BaseResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ProfileUpdateRequest request) {
        UserResponse updatedProfile = userProfileService.updateProfile(currentUser, request);
        return ResponseEntity.ok(new BaseResponse<>(true, updatedProfile, "Profile updated successfully"));
    }

    @Operation(summary = "Change password", description = "Change the current user's password")
    @PutMapping("/password")
    public ResponseEntity<BaseResponse<Void>> changePassword(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody PasswordChangeRequest request) {
        userProfileService.changePassword(currentUser, request);
        return ResponseEntity.ok(new BaseResponse<>(true, null, "Password changed successfully"));
    }
}
