package com.hatirlat.backend.controller.admin;

import com.hatirlat.backend.dto.BaseResponse;
import com.hatirlat.backend.dto.admin.AuditLogResponse;
import com.hatirlat.backend.entity.AuditLog;
import com.hatirlat.backend.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Admin controller for viewing audit logs
 * Requires ROLE_ADMIN access
 */
@RestController
@RequestMapping("/api/admin/audit-logs")
@Tag(name = "Admin Audit Logs", description = "Audit log viewing and analysis")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    /**
     * Get all audit logs with pagination
     */
    @GetMapping
    @Operation(summary = "Get all audit logs", description = "Get all audit logs with pagination")
    public ResponseEntity<BaseResponse<Page<AuditLogResponse>>> getAllLogs(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLog> logs = auditLogService.getAllLogs(pageable);
        Page<AuditLogResponse> responses = logs.map(AuditLogResponse::fromEntity);

        return ResponseEntity.ok(new BaseResponse<>(true, "Audit logs retrieved successfully", responses));
    }

    /**
     * Get recent audit logs (last 100)
     */
    @GetMapping("/recent")
    @Operation(summary = "Get recent audit logs")
    public ResponseEntity<BaseResponse<List<AuditLogResponse>>> getRecentLogs() {
        List<AuditLog> logs = auditLogService.getRecentLogs();
        List<AuditLogResponse> responses = logs.stream()
            .map(AuditLogResponse::fromEntity)
            .collect(Collectors.toList());

        return ResponseEntity.ok(new BaseResponse<>(true, "Recent audit logs retrieved", responses));
    }

    /**
     * Get audit logs by action type
     */
    @GetMapping("/action/{action}")
    @Operation(summary = "Get audit logs by action type")
    public ResponseEntity<BaseResponse<Page<AuditLogResponse>>> getLogsByAction(
        @PathVariable String action,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLog> logs = auditLogService.getLogsByAction(action, pageable);
        Page<AuditLogResponse> responses = logs.map(AuditLogResponse::fromEntity);

        return ResponseEntity.ok(new BaseResponse<>(true, "Audit logs retrieved successfully", responses));
    }

    /**
     * Get audit logs for a specific entity
     */
    @GetMapping("/entity/{entityType}/{entityId}")
    @Operation(summary = "Get audit logs for a specific entity")
    public ResponseEntity<BaseResponse<Page<AuditLogResponse>>> getLogsByEntity(
        @PathVariable String entityType,
        @PathVariable Long entityId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLog> logs = auditLogService.getLogsByTarget(entityType, entityId, pageable);
        Page<AuditLogResponse> responses = logs.map(AuditLogResponse::fromEntity);

        return ResponseEntity.ok(new BaseResponse<>(true, "Audit logs retrieved successfully", responses));
    }

    /**
     * Get audit logs within a time range
     */
    @GetMapping("/timerange")
    @Operation(summary = "Get audit logs within a time range")
    public ResponseEntity<BaseResponse<Page<AuditLogResponse>>> getLogsByTimeRange(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLog> logs = auditLogService.getLogsByTimeRange(startDate, endDate, pageable);
        Page<AuditLogResponse> responses = logs.map(AuditLogResponse::fromEntity);

        return ResponseEntity.ok(new BaseResponse<>(true, "Audit logs retrieved successfully", responses));
    }

    /**
     * Get action statistics
     */
    @GetMapping("/stats/actions")
    @Operation(summary = "Get action statistics", description = "Get count of each action type")
    public ResponseEntity<BaseResponse<Map<String, Long>>> getActionStats() {
        Map<String, Long> stats = auditLogService.getActionStats();
        return ResponseEntity.ok(new BaseResponse<>(true, "Action statistics retrieved", stats));
    }

    /**
     * Get admin activity statistics
     */
    @GetMapping("/stats/admins")
    @Operation(summary = "Get admin activity statistics", description = "Get count of actions per admin")
    public ResponseEntity<BaseResponse<Map<String, Long>>> getAdminActivityStats() {
        Map<String, Long> stats = auditLogService.getAdminActivityStats();
        return ResponseEntity.ok(new BaseResponse<>(true, "Admin activity statistics retrieved", stats));
    }
}
