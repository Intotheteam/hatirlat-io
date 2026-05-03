package com.hatirlat.backend.dto.admin;

import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for user management in admin panel
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserManagementResponse {

    private Long id;
    private String username;
    private String email;
    private UserRole role;
    private boolean banned;
    private String banReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Statistics
    private Long totalReminders;
    private Long activeReminders;
    private Long totalNotifications;
    private Long failedNotifications;

    /**
     * Convert entity to response DTO (basic info only)
     */
    public static UserManagementResponse fromEntity(User user) {
        UserManagementResponse response = new UserManagementResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setBanned(user.isBanned());
        response.setBanReason(user.getBanReason());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }
}
