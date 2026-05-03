package com.hatirlat.backend.dto.admin;

import com.hatirlat.backend.entity.ConfigType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating/updating system configurations
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemConfigRequest {

    @NotBlank(message = "Config key is required")
    private String configKey;

    private String configValue;

    @NotNull(message = "Config type is required")
    private ConfigType type;

    private boolean encrypted;

    private boolean active = true;

    private String description;
}
