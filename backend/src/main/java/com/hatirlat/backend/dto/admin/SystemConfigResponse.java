package com.hatirlat.backend.dto.admin;

import com.hatirlat.backend.entity.ConfigType;
import com.hatirlat.backend.entity.SystemConfig;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for system configurations
 * NOTE: Encrypted values are masked for security
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemConfigResponse {

    private Long id;
    private String configKey;
    private String configValue; // Masked if encrypted
    private ConfigType type;
    private boolean encrypted;
    private boolean active;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Convert entity to response DTO
     * Masks encrypted values for security
     */
    public static SystemConfigResponse fromEntity(SystemConfig config) {
        SystemConfigResponse response = new SystemConfigResponse();
        response.setId(config.getId());
        response.setConfigKey(config.getConfigKey());

        // Mask encrypted values
        if (config.isEncrypted()) {
            response.setConfigValue("[ENCRYPTED]");
        } else {
            response.setConfigValue(config.getConfigValue());
        }

        response.setType(config.getType());
        response.setEncrypted(config.isEncrypted());
        response.setActive(config.isActive());
        response.setDescription(config.getDescription());
        response.setCreatedAt(config.getCreatedAt());
        response.setUpdatedAt(config.getUpdatedAt());

        return response;
    }

    /**
     * Convert entity to response DTO with decrypted value
     * Use only when decrypted value is needed (e.g., API key edit form)
     */
    public static SystemConfigResponse fromEntityWithDecryptedValue(SystemConfig config, String decryptedValue) {
        SystemConfigResponse response = fromEntity(config);
        if (config.isEncrypted() && decryptedValue != null) {
            response.setConfigValue(decryptedValue);
        }
        return response;
    }
}
