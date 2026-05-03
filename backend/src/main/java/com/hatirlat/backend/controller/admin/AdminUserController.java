package com.hatirlat.backend.controller.admin;

import com.hatirlat.backend.dto.BaseResponse;
import com.hatirlat.backend.dto.admin.UserActionRequest;
import com.hatirlat.backend.dto.admin.UserManagementResponse;
import com.hatirlat.backend.entity.NotificationLogStatus;
import com.hatirlat.backend.entity.ReminderStatus;
import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.repository.NotificationLogRepository;
import com.hatirlat.backend.repository.ReminderRepository;
import com.hatirlat.backend.repository.UserRepository;
import com.hatirlat.backend.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Admin controller for user management
 * Requires ROLE_ADMIN access
 */
@RestController
@RequestMapping("/api/admin/users")
@Tag(name = "Admin Users", description = "User management for admins")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReminderRepository reminderRepository;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @Autowired
    private AuditLogService auditLogService;

    /**
     * Get all users with pagination
     */
    @GetMapping
    @Operation(summary = "Get all users", description = "Get all users with pagination and statistics")
    public ResponseEntity<BaseResponse<Page<UserManagementResponse>>> getAllUsers(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "createdAt") String sortBy,
        @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<User> users = userRepository.findAll(pageable);
        Page<UserManagementResponse> responses = users.map(user -> {
            UserManagementResponse response = UserManagementResponse.fromEntity(user);
            enrichWithStatistics(response, user);
            return response;
        });

        return ResponseEntity.ok(new BaseResponse<>(true, responses, "Users retrieved successfully"));
    }

    /**
     * Get a specific user by ID
     */
    @GetMapping("/{userId}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<BaseResponse<UserManagementResponse>> getUserById(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        UserManagementResponse response = UserManagementResponse.fromEntity(user);
        enrichWithStatistics(response, user);

        return ResponseEntity.ok(new BaseResponse<>(true, response, "User retrieved successfully"));
    }

    /**
     * Search users by username or email
     */
    @GetMapping("/search")
    @Operation(summary = "Search users", description = "Search users by username or email")
    public ResponseEntity<BaseResponse<List<UserManagementResponse>>> searchUsers(
        @RequestParam String query
    ) {
        List<User> users = userRepository.findAll().stream()
            .filter(u -> u.getUsername().toLowerCase().contains(query.toLowerCase()) ||
                        u.getEmail().toLowerCase().contains(query.toLowerCase()))
            .limit(20)
            .collect(Collectors.toList());

        List<UserManagementResponse> responses = users.stream()
            .map(user -> {
                UserManagementResponse response = UserManagementResponse.fromEntity(user);
                enrichWithStatistics(response, user);
                return response;
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(new BaseResponse<>(true, responses, "Search completed"));
    }

    /**
     * Ban a user
     */
    @PostMapping("/ban")
    @Operation(summary = "Ban a user")
    public ResponseEntity<BaseResponse<UserManagementResponse>> banUser(
        @Valid @RequestBody UserActionRequest request,
        @AuthenticationPrincipal User admin,
        HttpServletRequest httpRequest
    ) {
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new RuntimeException("User not found: " + request.getUserId()));

        user.setBanned(request.isBanned());
        user.setBanReason(request.getReason());
        userRepository.save(user);

        // Log the action
        auditLogService.logUserStatusChange(admin, user, request.isBanned(), request.getReason(), httpRequest);

        UserManagementResponse response = UserManagementResponse.fromEntity(user);
        enrichWithStatistics(response, user);

        return ResponseEntity.ok(new BaseResponse<>(true, response, "User ban status updated"));
    }

    /**
     * Unban a user
     */
    @PostMapping("/unban/{userId}")
    @Operation(summary = "Unban a user")
    public ResponseEntity<BaseResponse<UserManagementResponse>> unbanUser(
        @PathVariable Long userId,
        @AuthenticationPrincipal User admin,
        HttpServletRequest httpRequest
    ) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        user.setBanned(false);
        user.setBanReason(null);
        userRepository.save(user);

        // Log the action
        auditLogService.logUserStatusChange(admin, user, false, null, httpRequest);

        UserManagementResponse response = UserManagementResponse.fromEntity(user);
        enrichWithStatistics(response, user);

        return ResponseEntity.ok(new BaseResponse<>(true, response, "User unbanned successfully"));
    }

    /**
     * Delete a user (soft delete by banning)
     */
    @DeleteMapping("/{userId}")
    @Operation(summary = "Delete a user", description = "Permanently delete a user and all associated data")
    public ResponseEntity<BaseResponse<String>> deleteUser(
        @PathVariable Long userId,
        @AuthenticationPrincipal User admin,
        HttpServletRequest httpRequest
    ) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // Log before deletion
        auditLogService.logAction(admin, "USER_DELETED", "User", userId, null, httpRequest);

        // Delete user (cascading will handle related entities)
        userRepository.delete(user);

        return ResponseEntity.ok(new BaseResponse<>(true, user.getUsername(), "User deleted successfully"));
    }

    /**
     * Get user statistics
     */
    @GetMapping("/{userId}/stats")
    @Operation(summary = "Get detailed user statistics")
    public ResponseEntity<BaseResponse<UserManagementResponse>> getUserStats(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        UserManagementResponse response = UserManagementResponse.fromEntity(user);
        enrichWithStatistics(response, user);

        return ResponseEntity.ok(new BaseResponse<>(true, response, "User statistics retrieved"));
    }

    /**
     * Helper method to enrich user response with statistics
     */
    private void enrichWithStatistics(UserManagementResponse response, User user) {
        long totalReminders = reminderRepository.findByUser(user).size();
        long activeReminders = reminderRepository.findByUser(user).stream()
            .filter(r -> r.getStatus() == ReminderStatus.SCHEDULED)
            .count();

        long totalNotifications = notificationLogRepository.findByUserOrderBySentAtDesc(user).size();
        long failedNotifications = notificationLogRepository.countByUserAndStatus(user, NotificationLogStatus.FAILED);

        response.setTotalReminders(totalReminders);
        response.setActiveReminders(activeReminders);
        response.setTotalNotifications(totalNotifications);
        response.setFailedNotifications(failedNotifications);
    }
}
