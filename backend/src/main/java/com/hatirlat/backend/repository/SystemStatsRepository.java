package com.hatirlat.backend.repository;

import com.hatirlat.backend.entity.SystemStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SystemStatsRepository extends JpaRepository<SystemStats, Long> {

    /**
     * Find statistics for a specific date
     */
    Optional<SystemStats> findByDate(LocalDate date);

    /**
     * Find statistics for today
     */
    @Query("SELECT ss FROM SystemStats ss WHERE ss.date = CURRENT_DATE")
    Optional<SystemStats> findToday();

    /**
     * Find statistics for the last N days
     */
    @Query("SELECT ss FROM SystemStats ss WHERE ss.date >= :startDate ORDER BY ss.date DESC")
    List<SystemStats> findRecentStats(LocalDate startDate);

    /**
     * Get stats for the last 7 days
     */
    default List<SystemStats> findLast7Days() {
        return findRecentStats(LocalDate.now().minusDays(7));
    }

    /**
     * Get stats for the last 30 days
     */
    default List<SystemStats> findLast30Days() {
        return findRecentStats(LocalDate.now().minusDays(30));
    }

    /**
     * Delete old statistics (cleanup)
     */
    void deleteByDateBefore(LocalDate cutoffDate);
}
