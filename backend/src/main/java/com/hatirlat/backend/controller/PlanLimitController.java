package com.hatirlat.backend.controller;

import com.hatirlat.backend.dto.PlanLimitRequest;
import com.hatirlat.backend.dto.PlanLimitResponse;
import com.hatirlat.backend.entity.PlanLimitKey;
import com.hatirlat.backend.service.PlanLimitService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin-only REST controller for managing configurable plan limits.
 *
 * All endpoints require ROLE_ADMIN.
 *
 * GET /api/admin/plan-limits → list all limits
 * GET /api/admin/plan-limits/{key} → get one limit by key
 * PUT /api/admin/plan-limits/{key} → update a limit
 */
@RestController
@RequestMapping("/api/admin/plan-limits")
@PreAuthorize("hasRole('ADMIN')")
public class PlanLimitController {

    private final PlanLimitService planLimitService;

    public PlanLimitController(PlanLimitService planLimitService) {
        this.planLimitService = planLimitService;
    }

    /** Returns all plan limits. */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll() {
        List<PlanLimitResponse> limits = planLimitService.getAll();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", limits,
                "message", "Plan limits retrieved"));
    }

    /** Returns a single plan limit by its key name (e.g. FREE_MAX_GROUPS). */
    @GetMapping("/{key}")
    public ResponseEntity<Map<String, Object>> getByKey(@PathVariable String key) {
        PlanLimitKey limitKey = PlanLimitKey.valueOf(key.toUpperCase());
        PlanLimitResponse response = planLimitService.getByKey(limitKey);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", response,
                "message", "Plan limit retrieved"));
    }

    /**
     * Updates a plan limit.
     *
     * Example body for numeric limit:
     * { "intValue": 5, "boolValue": false, "description": "..." }
     *
     * Example body for bool flag:
     * { "intValue": 1, "boolValue": true, "description": "..." }
     */
    @PutMapping("/{key}")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable String key,
            @RequestBody PlanLimitRequest request) {
        PlanLimitKey limitKey = PlanLimitKey.valueOf(key.toUpperCase());
        PlanLimitResponse response = planLimitService.update(limitKey, request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", response,
                "message", "Plan limit updated"));
    }

    /**
     * Returns all valid limit key names (useful for building admin UI dropdowns).
     */
    @GetMapping("/keys")
    public ResponseEntity<Map<String, Object>> getKeys() {
        List<String> keys = java.util.Arrays.stream(PlanLimitKey.values())
                .map(Enum::name)
                .toList();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", keys,
                "message", "Plan limit keys retrieved"));
    }
}
