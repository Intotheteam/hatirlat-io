package com.hatirlat.backend.service;

import com.hatirlat.backend.entity.ConfigType;
import com.hatirlat.backend.entity.SystemConfig;
import com.hatirlat.backend.repository.SystemConfigRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service for managing system configurations, API keys, and feature flags.
 * Handles encryption/decryption transparently for sensitive data.
 */
@Service
@Transactional
public class SystemConfigService {

    private static final Logger logger = LoggerFactory.getLogger(SystemConfigService.class);

    @Autowired
    private SystemConfigRepository configRepository;

    @Autowired
    private EncryptionService encryptionService;

    /**
     * Get a configuration value by key (decrypted if necessary)
     *
     * @param key Configuration key
     * @return Decrypted configuration value, or null if not found
     */
    public String getConfig(String key) {
        Optional<SystemConfig> config = configRepository.findByConfigKey(key);
        if (config.isEmpty()) {
            logger.warn("Configuration key '{}' not found", key);
            return null;
        }

        SystemConfig systemConfig = config.get();
        if (!systemConfig.isActive()) {
            logger.warn("Configuration key '{}' is inactive", key);
            return null;
        }

        String value = systemConfig.getConfigValue();
        if (systemConfig.isEncrypted() && value != null) {
            try {
                return encryptionService.decrypt(value);
            } catch (Exception e) {
                logger.error("Failed to decrypt config key '{}'", key, e);
                throw new RuntimeException("Failed to decrypt configuration value", e);
            }
        }

        return value;
    }

    /**
     * Get a configuration value with a default fallback
     *
     * @param key Configuration key
     * @param defaultValue Default value if key not found or inactive
     * @return Configuration value or default
     */
    public String getConfig(String key, String defaultValue) {
        String value = getConfig(key);
        return value != null ? value : defaultValue;
    }

    /**
     * Get a boolean configuration value
     *
     * @param key Configuration key
     * @param defaultValue Default value
     * @return Boolean configuration value
     */
    public boolean getBooleanConfig(String key, boolean defaultValue) {
        String value = getConfig(key);
        return value != null ? Boolean.parseBoolean(value) : defaultValue;
    }

    /**
     * Get an integer configuration value
     *
     * @param key Configuration key
     * @param defaultValue Default value
     * @return Integer configuration value
     */
    public int getIntConfig(String key, int defaultValue) {
        String value = getConfig(key);
        if (value == null) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            logger.warn("Config key '{}' is not a valid integer: '{}'", key, value);
            return defaultValue;
        }
    }

    /**
     * Set a configuration value (encrypted if specified)
     *
     * @param key Configuration key
     * @param value Configuration value
     * @param type Configuration type
     * @param encrypt Whether to encrypt the value
     */
    public void setConfig(String key, String value, ConfigType type, boolean encrypt) {
        SystemConfig config = configRepository.findByConfigKey(key)
            .orElse(new SystemConfig(key, null, type));

        String finalValue = value;
        if (encrypt && value != null) {
            try {
                finalValue = encryptionService.encrypt(value);
            } catch (Exception e) {
                logger.error("Failed to encrypt config key '{}'", key, e);
                throw new RuntimeException("Failed to encrypt configuration value", e);
            }
        }

        config.setConfigValue(finalValue);
        config.setEncrypted(encrypt);
        config.setType(type);
        config.setActive(true);

        configRepository.save(config);
        logger.info("Configuration '{}' updated (encrypted: {})", key, encrypt);
    }

    /**
     * Set a simple configuration without encryption
     *
     * @param key Configuration key
     * @param value Configuration value
     * @param type Configuration type
     */
    public void setConfig(String key, String value, ConfigType type) {
        setConfig(key, value, type, false);
    }

    /**
     * Toggle a feature flag
     *
     * @param featureKey Feature key (e.g., "feature.whatsapp.enabled")
     * @param enabled Whether the feature should be enabled
     */
    public void toggleFeature(String featureKey, boolean enabled) {
        setConfig(featureKey, String.valueOf(enabled), ConfigType.FEATURE_FLAG, false);
        logger.info("Feature '{}' toggled to: {}", featureKey, enabled);
    }

    /**
     * Check if a feature is enabled
     *
     * @param featureKey Feature key
     * @return true if feature is enabled, false otherwise
     */
    public boolean isFeatureEnabled(String featureKey) {
        return getBooleanConfig(featureKey, false);
    }

    /**
     * Get all configurations of a specific type
     *
     * @param type Configuration type
     * @return Map of key-value pairs (decrypted)
     */
    public Map<String, String> getAllConfigs(ConfigType type) {
        List<SystemConfig> configs = configRepository.findByTypeAndActiveTrue(type);
        Map<String, String> result = new HashMap<>();

        for (SystemConfig config : configs) {
            String value = config.getConfigValue();
            if (config.isEncrypted() && value != null) {
                try {
                    value = encryptionService.decrypt(value);
                } catch (Exception e) {
                    logger.error("Failed to decrypt config '{}'", config.getConfigKey(), e);
                    value = "[DECRYPTION_ERROR]";
                }
            }
            result.put(config.getConfigKey(), value);
        }

        return result;
    }

    /**
     * Get all configurations (for admin panel display)
     * Note: Encrypted values are marked but not decrypted for security
     *
     * @return List of all system configs
     */
    public List<SystemConfig> getAllConfigsRaw() {
        return configRepository.findAll();
    }

    /**
     * Get configurations by key prefix
     *
     * @param prefix Key prefix (e.g., "twilio.")
     * @return List of matching configs
     */
    public List<SystemConfig> getConfigsByPrefix(String prefix) {
        return configRepository.findByConfigKeyStartingWith(prefix);
    }

    /**
     * Delete a configuration
     *
     * @param key Configuration key
     */
    public void deleteConfig(String key) {
        configRepository.deleteByConfigKey(key);
        logger.info("Configuration '{}' deleted", key);
    }

    /**
     * Activate or deactivate a configuration
     *
     * @param key Configuration key
     * @param active Whether to activate or deactivate
     */
    public void setConfigActive(String key, boolean active) {
        SystemConfig config = configRepository.findByConfigKey(key)
            .orElseThrow(() -> new RuntimeException("Config key not found: " + key));

        config.setActive(active);
        configRepository.save(config);
        logger.info("Configuration '{}' set to active: {}", key, active);
    }
}
