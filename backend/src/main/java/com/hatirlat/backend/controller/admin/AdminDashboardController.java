package com.hatirlat.backend.controller.admin;

import com.hatirlat.backend.dto.BaseResponse;
import com.hatirlat.backend.dto.admin.DashboardStatsResponse;
import com.hatirlat.backend.entity.SystemStats;
import com.hatirlat.backend.service.SystemStatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Admin dashboard controller for system statistics and monitoring
 * Requires ROLE_ADMIN access
 */
@RestController
@RequestMapping("/api/admin/dashboard")
@Tag(name = "Admin Dashboard", description = "Admin panel dashboard and statistics")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    @Autowired
    private SystemStatsService statsService;

    /**
     * Get comprehensive dashboard statistics
     */
    @GetMapping("/stats")
    @Operation(summary = "Get dashboard statistics", description = "Get comprehensive system statistics for admin dashboard")
    public ResponseEntity<BaseResponse<DashboardStatsResponse>> getDashboardStats() {
        Map<String, Object> summary = statsService.getDashboardSummary();

        DashboardStatsResponse response = new DashboardStatsResponse();
        response.setToday((SystemStats) summary.get("today"));
        response.setTodayAdditionalMetrics((Map<String, Object>) summary.get("todayAdditionalMetrics"));
        response.setUserGrowth7d((Long) summary.get("userGrowth7d"));
        response.setReminderGrowth7d((Long) summary.get("reminderGrowth7d"));
        response.setWeeklyNotifications((Long) summary.get("weeklyNotifications"));
        response.setWeeklyFailed((Long) summary.get("weeklyFailed"));
        response.setLast7Days((List<SystemStats>) summary.get("last7Days"));

        // Get 30-day stats separately
        response.setLast30Days(statsService.getLast30DaysStats());

        // Add real-time counts
        SystemStats today = response.getToday();
        response.setTotalUsers(today.getTotalUsers());
        response.setPremiumUsers(today.getPremiumUsers());
        response.setTotalReminders(today.getTotalReminders());
        response.setActiveReminders(today.getActiveReminders());
        response.setTotalGroups(today.getTotalGroups());

        return ResponseEntity.ok(new BaseResponse<>(true, response, "Dashboard stats retrieved successfully"));
    }

    /**
     * Get stats for today
     */
    @GetMapping("/stats/today")
    @Operation(summary = "Get today's statistics")
    public ResponseEntity<BaseResponse<SystemStats>> getTodayStats() {
        SystemStats stats = statsService.getTodayStats();
        return ResponseEntity.ok(new BaseResponse<>(true, stats, "Today's stats retrieved successfully"));
    }

    /**
     * Get stats for a specific date
     */
    @GetMapping("/stats/date/{date}")
    @Operation(summary = "Get statistics for a specific date")
    public ResponseEntity<BaseResponse<SystemStats>> getStatsForDate(@PathVariable String date) {
        LocalDate localDate = LocalDate.parse(date);
        SystemStats stats = statsService.getStatsForDate(localDate);
        return ResponseEntity.ok(new BaseResponse<>(true, stats, "Stats retrieved successfully"));
    }

    /**
     * Get stats for the last N days
     */
    @GetMapping("/stats/recent/{days}")
    @Operation(summary = "Get statistics for the last N days")
    public ResponseEntity<BaseResponse<List<SystemStats>>> getRecentStats(@PathVariable int days) {
        List<SystemStats> stats = statsService.getRecentStats(days);
        return ResponseEntity.ok(new BaseResponse<>(true, stats, "Recent stats retrieved successfully"));
    }

    /**
     * Force recalculation of today's stats
     */
    @PostMapping("/stats/recalculate")
    @Operation(summary = "Force recalculation of today's statistics")
    public ResponseEntity<BaseResponse<SystemStats>> recalculateStats() {
        SystemStats stats = statsService.recalculateStatsForDate(LocalDate.now());
        return ResponseEntity.ok(new BaseResponse<>(true, stats, "Stats recalculated successfully"));
    }

    /**
     * Force recalculation for a specific date
     */
    @PostMapping("/stats/recalculate/{date}")
    @Operation(summary = "Force recalculation for a specific date")
    public ResponseEntity<BaseResponse<SystemStats>> recalculateStatsForDate(@PathVariable String date) {
        LocalDate localDate = LocalDate.parse(date);
        SystemStats stats = statsService.recalculateStatsForDate(localDate);
        return ResponseEntity.ok(new BaseResponse<>(true, stats, "Stats recalculated successfully"));
    }
}
