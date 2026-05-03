package com.hatirlat.backend.service;

import com.hatirlat.backend.entity.AuditLog;
import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.repository.AuditLogRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for recording and querying admin audit logs.
 * Logs all administrative actions for security and compliance.
 */
@Service
@Transactional
public class AuditLogService {

    private static final Logger logger = LoggerFactory.getLogger(AuditLogService.class);

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Log an admin action asynchronously
     *
     * @param admin Admin user performing the action
     * @param action Action type (e.g., "USER_BANNED", "CONFIG_UPDATED")
     * @param targetEntity Target entity type (e.g., "User", "SystemConfig")
     * @param targetId Target entity ID
     * @param details Additional details (will be converted to JSON)
     * @param request HTTP request for IP and user agent
     */
    @Async
    public void logAction(User admin, String action, String targetEntity, Long targetId,
                         Map<String, Object> details, HttpServletRequest request) {
        try {
            String detailsJson = details != null ? objectMapper.writeValueAsString(details) : null;
            String ipAddress = extractIpAddress(request);
            String userAgent = request != null ? request.getHeader("User-Agent") : null;

            AuditLog auditLog = AuditLog.builder()
                .admin(admin)
                .action(action)
                .targetEntity(targetEntity)
                .targetId(targetId)
                .details(detailsJson)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();

            auditLogRepository.save(auditLog);
            logger.info("Audit log created: {} by {} on {} #{}", action, admin.getUsername(), targetEntity, targetId);
        } catch (JsonProcessingException e) {
            logger.error("Failed to serialize audit log details", e);
        } catch (Exception e) {
            logger.error("Failed to create audit log", e);
        }
    }

    /**
     * Log an admin action without request context
     */
    @Async
    public void logAction(User admin, String action, String targetEntity, Long targetId, Map<String, Object> details) {
        logAction(admin, action, targetEntity, targetId, details, null);
    }

    /**
     * Log a simple action without details
     */
    @Async
    public void logAction(User admin, String action, String targetEntity, Long targetId, HttpServletRequest request) {
        logAction(admin, action, targetEntity, targetId, null, request);
    }

    /**
     * Log a config change with before/after values
     */
    @Async
    public void logConfigChange(User admin, String configKey, String oldValue, String newValue, HttpServletRequest request) {
        Map<String, Object> details = new HashMap<>();
        details.put("configKey", configKey);
        details.put("oldValue", oldValue);
        details.put("newValue", newValue);

        logAction(admin, "CONFIG_UPDATED", "SystemConfig", null, details, request);
    }

    /**
     * Log a user status change (ban/unban)
     */
    @Async
    public void logUserStatusChange(User admin, User targetUser, boolean banned, String reason, HttpServletRequest request) {
        Map<String, Object> details = new HashMap<>();
        details.put("username", targetUser.getUsername());
        details.put("email", targetUser.getEmail());
        details.put("banned", banned);
        details.put("reason", reason);

        String action = banned ? "USER_BANNED" : "USER_UNBANNED";
        logAction(admin, action, "User", targetUser.getId(), details, request);
    }

    /**
     * Log a feature flag change
     */
    @Async
    public void logFeatureFlagChange(User admin, String featureKey, boolean enabled, HttpServletRequest request) {
        Map<String, Object> details = new HashMap<>();
        details.put("featureKey", featureKey);
        details.put("enabled", enabled);

        logAction(admin, "FEATURE_FLAG_TOGGLED", "SystemConfig", null, details, request);
    }

    /**
     * Get all audit logs with pagination
     */
    @Transactional(readOnly = true)
    public Page<AuditLog> getAllLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByTimestampDesc(pageable);
    }

    /**
     * Get audit logs by admin user
     */
    @Transactional(readOnly = true)
    public Page<AuditLog> getLogsByAdmin(User admin, Pageable pageable) {
        return auditLogRepository.findByAdmin(admin, pageable);
    }

    /**
     * Get audit logs by action type
     */
    @Transactional(readOnly = true)
    public Page<AuditLog> getLogsByAction(String action, Pageable pageable) {
        return auditLogRepository.findByAction(action, pageable);
    }

    /**
     * Get audit logs for a specific entity
     */
    @Transactional(readOnly = true)
    public Page<AuditLog> getLogsByTarget(String targetEntity, Long targetId, Pageable pageable) {
        return auditLogRepository.findByTargetEntityAndTargetId(targetEntity, targetId, pageable);
    }

    /**
     * Get audit logs within a time range
     */
    @Transactional(readOnly = true)
    public Page<AuditLog> getLogsByTimeRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return auditLogRepository.findByTimestampBetween(startDate, endDate, pageable);
    }

    /**
     * Get recent audit logs (top 100)
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc();
    }

    /**
     * Get action statistics (count by action type)
     */
    @Transactional(readOnly = true)
    public Map<String, Long> getActionStats() {
        List<Object[]> results = auditLogRepository.countByAction();
        Map<String, Long> stats = new HashMap<>();

        for (Object[] result : results) {
            String action = (String) result[0];
            Long count = (Long) result[1];
            stats.put(action, count);
        }

        return stats;
    }

    /**
     * Get admin activity statistics (count by admin)
     */
    @Transactional(readOnly = true)
    public Map<String, Long> getAdminActivityStats() {
        List<Object[]> results = auditLogRepository.countByAdmin();
        Map<String, Long> stats = new HashMap<>();

        for (Object[] result : results) {
            String username = (String) result[0];
            Long count = (Long) result[1];
            stats.put(username, count);
        }

        return stats;
    }

    /**
     * Extract IP address from request, handling proxy headers
     */
    private String extractIpAddress(HttpServletRequest request) {
        if (request == null) {
            return null;
        }

        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_CLUSTER_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_FORWARDED");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }

        // Handle multiple IPs (X-Forwarded-For can have multiple IPs)
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }

        return ip;
    }
}
