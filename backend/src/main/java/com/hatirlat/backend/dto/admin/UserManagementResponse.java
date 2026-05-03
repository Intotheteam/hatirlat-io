package com.hatirlat.backend.dto.admin;

import com.hatirlat.backend.entity.Role;
import com.hatirlat.backend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserManagementResponse {

    private Long id;
    private String username;
    private String email;
    private String role;
    private boolean banned;
    private String banReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Statistics (enriched separately)
    private Long totalReminders;
    private Long activeReminders;
    private Long totalNotifications;
    private Long failedNotifications;

    public static UserManagementResponse fromEntity(User user) {
        UserManagementResponse response = new UserManagementResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole() != null ? user.getRole().name() : "USER");
        response.setBanned(user.isBanned());
        response.setBanReason(user.getBanReason());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }
}
