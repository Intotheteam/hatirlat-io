package com.hatirlat.backend.dto.admin;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for admin actions on users (ban/unban)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserActionRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    private boolean banned;

    private String reason;
}
