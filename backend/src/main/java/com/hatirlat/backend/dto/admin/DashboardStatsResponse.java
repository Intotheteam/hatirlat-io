package com.hatirlat.backend.dto.admin;

import com.hatirlat.backend.entity.SystemStats;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Response DTO for admin dashboard statistics
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    // Today's stats
    private SystemStats today;
    private Map<String, Object> todayAdditionalMetrics;

    // Growth metrics
    private Long userGrowth7d;
    private Long reminderGrowth7d;

    // Weekly aggregates
    private Long weeklyNotifications;
    private Long weeklyFailed;

    // Historical data
    private List<SystemStats> last7Days;
    private List<SystemStats> last30Days;

    // Real-time metrics
    private Long totalUsers;
    private Long premiumUsers;
    private Long totalReminders;
    private Long activeReminders;
    private Long totalGroups;
}
