package com.hatirlat.backend.repository;

import com.hatirlat.backend.entity.ConfigType;
import com.hatirlat.backend.entity.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfig, Long> {

    /**
     * Find a configuration by its unique key
     */
    Optional<SystemConfig> findByConfigKey(String configKey);

    /**
     * Find all configurations of a specific type
     */
    List<SystemConfig> findByType(ConfigType type);

    /**
     * Find all active configurations
     */
    List<SystemConfig> findByActiveTrue();

    /**
     * Find all active configurations of a specific type
     */
    List<SystemConfig> findByTypeAndActiveTrue(ConfigType type);

    /**
     * Check if a configuration key exists
     */
    boolean existsByConfigKey(String configKey);

    /**
     * Find configurations with keys starting with a prefix
     * Useful for grouping related configs (e.g., "twilio.*", "feature.*")
     */
    @Query("SELECT sc FROM SystemConfig sc WHERE sc.configKey LIKE :prefix%")
    List<SystemConfig> findByConfigKeyStartingWith(@Param("prefix") String prefix);

    /**
     * Delete a configuration by key
     */
    void deleteByConfigKey(String configKey);
}
