package com.hatirlat.backend.service;

import com.hatirlat.backend.dto.PlanLimitRequest;
import com.hatirlat.backend.dto.PlanLimitResponse;
import com.hatirlat.backend.entity.PlanLimit;
import com.hatirlat.backend.entity.PlanLimitKey;
import com.hatirlat.backend.exception.ResourceNotFoundException;
import com.hatirlat.backend.repository.PlanLimitRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Manages configurable plan limits stored in the `plan_limits` DB table.
 * Default values are seeded on first startup via {@link #seedDefaults()}.
 * All limit reads go through this service — hot-changeable at runtime via the
 * admin API.
 */
@Service
public class PlanLimitService {

    private static final Logger logger = LoggerFactory.getLogger(PlanLimitService.class);

    private final PlanLimitRepository planLimitRepository;

    public PlanLimitService(PlanLimitRepository planLimitRepository) {
        this.planLimitRepository = planLimitRepository;
    }

    // ── Default Seed ─────────────────────────────────────────────────────────────

    @PostConstruct
    @Transactional
    public void seedDefaults() {
        seedIfAbsent(PlanLimitKey.FREE_MAX_GROUP_REMINDERS, 3, false,
                "Ücretsiz kullanıcıların oluşturabileceği maksimum grup hatırlatıcısı sayısı");
        seedIfAbsent(PlanLimitKey.FREE_MAX_GROUPS, 3, false,
                "Ücretsiz kullanıcıların oluşturabileceği maksimum grup sayısı");
        seedIfAbsent(PlanLimitKey.FREE_MAX_MEMBERS_PER_GROUP, 10, false,
                "Ücretsiz kullanıcıların gruba ekleyebileceği maksimum üye sayısı");
        seedIfAbsent(PlanLimitKey.FREE_HOURLY_REPEAT_ALLOWED, 0, false,
                "Ücretsiz kullanıcılar saatlik tekrar kullanabilir mi? (0=hayır, 1=evet)");

        seedIfAbsent(PlanLimitKey.PREMIUM_MAX_GROUP_REMINDERS, -1, true,
                "Premium kullanıcıların oluşturabileceği maksimum grup hatırlatıcısı sayısı (-1 = sınırsız)");
        seedIfAbsent(PlanLimitKey.PREMIUM_MAX_GROUPS, 10, false,
                "Premium kullanıcıların oluşturabileceği maksimum grup sayısı");
        seedIfAbsent(PlanLimitKey.PREMIUM_MAX_MEMBERS_PER_GROUP, 300, false,
                "Premium kullanıcıların gruba ekleyebileceği maksimum üye sayısı");
        seedIfAbsent(PlanLimitKey.PREMIUM_HOURLY_REPEAT_ALLOWED, 1, true,
                "Premium kullanıcılar saatlik tekrar kullanabilir mi? (0=hayır, 1=evet)");

        logger.info("Plan limits seeded/verified.");
    }

    private void seedIfAbsent(PlanLimitKey key, int intValue, boolean boolValue, String description) {
        if (planLimitRepository.findByLimitKey(key).isEmpty()) {
            planLimitRepository.save(new PlanLimit(key, intValue, boolValue, description));
            logger.debug("Seeded plan limit: {} = {}", key, intValue);
        }
    }

    // ── Public Getters
    // ────────────────────────────────────────────────────────────

    /**
     * Returns the int value for a given limit key.
     * Falls back to a hardcoded safe default if the row is missing (shouldn't
     * happen after seed).
     */
    public int getInt(PlanLimitKey key) {
        return planLimitRepository.findByLimitKey(key)
                .map(PlanLimit::getIntValue)
                .orElseGet(() -> fallbackInt(key));
    }

    public boolean getBool(PlanLimitKey key) {
        return planLimitRepository.findByLimitKey(key)
                .map(PlanLimit::isBoolValue)
                .orElse(false);
    }

    // ── Convenience Getters
    // ───────────────────────────────────────────────────────

    public int freeMaxGroupReminders() {
        return getInt(PlanLimitKey.FREE_MAX_GROUP_REMINDERS);
    }

    public int freeMaxGroups() {
        return getInt(PlanLimitKey.FREE_MAX_GROUPS);
    }

    public int freeMaxMembers() {
        return getInt(PlanLimitKey.FREE_MAX_MEMBERS_PER_GROUP);
    }

    public boolean freeHourlyAllowed() {
        return getBool(PlanLimitKey.FREE_HOURLY_REPEAT_ALLOWED);
    }

    public int premiumMaxGroupReminders() {
        return getInt(PlanLimitKey.PREMIUM_MAX_GROUP_REMINDERS);
    }

    public int premiumMaxGroups() {
        return getInt(PlanLimitKey.PREMIUM_MAX_GROUPS);
    }

    public int premiumMaxMembers() {
        return getInt(PlanLimitKey.PREMIUM_MAX_MEMBERS_PER_GROUP);
    }

    public boolean premiumHourlyAllowed() {
        return getBool(PlanLimitKey.PREMIUM_HOURLY_REPEAT_ALLOWED);
    }

    // ── Admin CRUD
    // ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<PlanLimitResponse> getAll() {
        return planLimitRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PlanLimitResponse getByKey(PlanLimitKey key) {
        PlanLimit limit = planLimitRepository.findByLimitKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("PlanLimit", key.name()));
        return toDto(limit);
    }

    @Transactional
    public PlanLimitResponse update(PlanLimitKey key, PlanLimitRequest request) {
        PlanLimit limit = planLimitRepository.findByLimitKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("PlanLimit", key.name()));
        limit.setIntValue(request.getIntValue());
        limit.setBoolValue(request.isBoolValue());
        if (request.getDescription() != null) {
            limit.setDescription(request.getDescription());
        }
        PlanLimit saved = planLimitRepository.save(limit);
        logger.info("Plan limit updated: {} -> int={}, bool={}", key, saved.getIntValue(), saved.isBoolValue());
        return toDto(saved);
    }

    // ── Helpers
    // ───────────────────────────────────────────────────────────────────

    private PlanLimitResponse toDto(PlanLimit limit) {
        return new PlanLimitResponse(
                limit.getId(),
                limit.getLimitKey(),
                limit.getIntValue(),
                limit.isBoolValue(),
                limit.getDescription(),
                limit.getUpdatedAt());
    }

    private int fallbackInt(PlanLimitKey key) {
        return switch (key) {
            case FREE_MAX_GROUP_REMINDERS -> 3;
            case FREE_MAX_GROUPS -> 3;
            case FREE_MAX_MEMBERS_PER_GROUP -> 10;
            case FREE_HOURLY_REPEAT_ALLOWED -> 0;
            case PREMIUM_MAX_GROUP_REMINDERS -> -1;
            case PREMIUM_MAX_GROUPS -> 10;
            case PREMIUM_MAX_MEMBERS_PER_GROUP -> 300;
            case PREMIUM_HOURLY_REPEAT_ALLOWED -> 1;
        };
    }
}
