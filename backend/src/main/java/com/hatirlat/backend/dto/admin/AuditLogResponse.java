package com.hatirlat.backend.dto.admin;

import com.hatirlat.backend.entity.AuditLog;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for audit logs
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {

    private Long id;
    private String adminUsername;
    private String action;
    private String targetEntity;
    private Long targetId;
    private String details; // JSON string
    private String ipAddress;
    private LocalDateTime timestamp;

    /**
     * Convert entity to response DTO
     */
    public static AuditLogResponse fromEntity(AuditLog log) {
        AuditLogResponse response = new AuditLogResponse();
        response.setId(log.getId());
        response.setAdminUsername(log.getAdmin() != null ? log.getAdmin().getUsername() : "System");
        response.setAction(log.getAction());
        response.setTargetEntity(log.getTargetEntity());
        response.setTargetId(log.getTargetId());
        response.setDetails(log.getDetails());
        response.setIpAddress(log.getIpAddress());
        response.setTimestamp(log.getTimestamp());
        return response;
    }
}
