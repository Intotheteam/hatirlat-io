package com.hatirlat.backend.controller.admin;

import com.hatirlat.backend.dto.BaseResponse;
import com.hatirlat.backend.dto.admin.SystemConfigRequest;
import com.hatirlat.backend.dto.admin.SystemConfigResponse;
import com.hatirlat.backend.entity.ConfigType;
import com.hatirlat.backend.entity.SystemConfig;
import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.service.AuditLogService;
import com.hatirlat.backend.service.SystemConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Admin controller for managing system configurations and API keys
 * Requires ROLE_ADMIN access
 */
@RestController
@RequestMapping("/api/admin/config")
@Tag(name = "Admin Config", description = "System configuration and API key management")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminConfigController {

    @Autowired
    private SystemConfigService configService;

    @Autowired
    private AuditLogService auditLogService;

    /**
     * Get all system configurations
     */
    @GetMapping
    @Operation(summary = "Get all system configurations", description = "Get all configurations (encrypted values are masked)")
    public ResponseEntity<BaseResponse<List<SystemConfigResponse>>> getAllConfigs() {
        List<SystemConfig> configs = configService.getAllConfigsRaw();
        List<SystemConfigResponse> responses = configs.stream()
            .map(SystemConfigResponse::fromEntity)
            .collect(Collectors.toList());

        return ResponseEntity.ok(new BaseResponse<>(true, "Configurations retrieved successfully", responses));
    }

    /**
     * Get configurations by type
     */
    @GetMapping("/type/{type}")
    @Operation(summary = "Get configurations by type")
    public ResponseEntity<BaseResponse<Map<String, String>>> getConfigsByType(@PathVariable ConfigType type) {
        Map<String, String> configs = configService.getAllConfigs(type);
        return ResponseEntity.ok(new BaseResponse<>(true, "Configurations retrieved successfully", configs));
    }

    /**
     * Get configurations by key prefix
     */
    @GetMapping("/prefix/{prefix}")
    @Operation(summary = "Get configurations by key prefix")
    public ResponseEntity<BaseResponse<List<SystemConfigResponse>>> getConfigsByPrefix(@PathVariable String prefix) {
        List<SystemConfig> configs = configService.getConfigsByPrefix(prefix);
        List<SystemConfigResponse> responses = configs.stream()
            .map(SystemConfigResponse::fromEntity)
            .collect(Collectors.toList());

        return ResponseEntity.ok(new BaseResponse<>(true, "Configurations retrieved successfully", responses));
    }

    /**
     * Get a specific configuration (decrypted)
     */
    @GetMapping("/{key}")
    @Operation(summary = "Get a specific configuration", description = "Returns decrypted value for editing")
    public ResponseEntity<BaseResponse<SystemConfigResponse>> getConfig(@PathVariable String key) {
        String value = configService.getConfig(key);
        SystemConfig config = configService.getConfigsByPrefix(key).stream()
            .filter(c -> c.getConfigKey().equals(key))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Config not found: " + key));

        SystemConfigResponse response = SystemConfigResponse.fromEntityWithDecryptedValue(config, value);
        return ResponseEntity.ok(new BaseResponse<>(true, "Configuration retrieved successfully", response));
    }

    /**
     * Create or update a configuration
     */
    @PostMapping
    @Operation(summary = "Create or update configuration")
    public ResponseEntity<BaseResponse<String>> setConfig(
        @Valid @RequestBody SystemConfigRequest request,
        @AuthenticationPrincipal User admin,
        HttpServletRequest httpRequest
    ) {
        String oldValue = configService.getConfig(request.getConfigKey());

        configService.setConfig(
            request.getConfigKey(),
            request.getConfigValue(),
            request.getType(),
            request.isEncrypted()
        );

        // Log the change
        auditLogService.logConfigChange(admin, request.getConfigKey(), oldValue, request.getConfigValue(), httpRequest);

        return ResponseEntity.ok(new BaseResponse<>(true, "Configuration saved successfully", request.getConfigKey()));
    }

    /**
     * Toggle a feature flag
     */
    @PostMapping("/feature/{featureKey}/toggle")
    @Operation(summary = "Toggle a feature flag")
    public ResponseEntity<BaseResponse<Boolean>> toggleFeature(
        @PathVariable String featureKey,
        @RequestParam boolean enabled,
        @AuthenticationPrincipal User admin,
        HttpServletRequest httpRequest
    ) {
        configService.toggleFeature(featureKey, enabled);

        // Log the change
        auditLogService.logFeatureFlagChange(admin, featureKey, enabled, httpRequest);

        return ResponseEntity.ok(new BaseResponse<>(true, "Feature flag toggled successfully", enabled));
    }

    /**
     * Check if a feature is enabled
     */
    @GetMapping("/feature/{featureKey}")
    @Operation(summary = "Check if a feature is enabled")
    public ResponseEntity<BaseResponse<Boolean>> isFeatureEnabled(@PathVariable String featureKey) {
        boolean enabled = configService.isFeatureEnabled(featureKey);
        return ResponseEntity.ok(new BaseResponse<>(true, "Feature status retrieved", enabled));
    }

    /**
     * Activate or deactivate a configuration
     */
    @PutMapping("/{key}/active")
    @Operation(summary = "Activate or deactivate a configuration")
    public ResponseEntity<BaseResponse<String>> setConfigActive(
        @PathVariable String key,
        @RequestParam boolean active,
        @AuthenticationPrincipal User admin,
        HttpServletRequest httpRequest
    ) {
        configService.setConfigActive(key, active);

        // Log the change
        Map<String, Object> details = new HashMap<>();
        details.put("configKey", key);
        details.put("active", active);
        auditLogService.logAction(admin, "CONFIG_STATUS_CHANGED", "SystemConfig", null, details, httpRequest);

        return ResponseEntity.ok(new BaseResponse<>(true, "Configuration status updated", key));
    }

    /**
     * Delete a configuration
     */
    @DeleteMapping("/{key}")
    @Operation(summary = "Delete a configuration")
    public ResponseEntity<BaseResponse<String>> deleteConfig(
        @PathVariable String key,
        @AuthenticationPrincipal User admin,
        HttpServletRequest httpRequest
    ) {
        String oldValue = configService.getConfig(key);
        configService.deleteConfig(key);

        // Log the deletion
        Map<String, Object> details = new HashMap<>();
        details.put("configKey", key);
        details.put("deletedValue", "[REDACTED]");
        auditLogService.logAction(admin, "CONFIG_DELETED", "SystemConfig", null, details, httpRequest);

        return ResponseEntity.ok(new BaseResponse<>(true, "Configuration deleted successfully", key));
    }

    /**
     * Bulk update configurations (for initial setup)
     */
    @PostMapping("/bulk")
    @Operation(summary = "Bulk update configurations")
    public ResponseEntity<BaseResponse<Integer>> bulkUpdateConfigs(
        @Valid @RequestBody List<SystemConfigRequest> requests,
        @AuthenticationPrincipal User admin,
        HttpServletRequest httpRequest
    ) {
        for (SystemConfigRequest request : requests) {
            configService.setConfig(
                request.getConfigKey(),
                request.getConfigValue(),
                request.getType(),
                request.isEncrypted()
            );
        }

        // Log bulk update
        Map<String, Object> details = new HashMap<>();
        details.put("count", requests.size());
        auditLogService.logAction(admin, "CONFIG_BULK_UPDATE", "SystemConfig", null, details, httpRequest);

        return ResponseEntity.ok(new BaseResponse<>(true, "Configurations updated successfully", requests.size()));
    }
}
