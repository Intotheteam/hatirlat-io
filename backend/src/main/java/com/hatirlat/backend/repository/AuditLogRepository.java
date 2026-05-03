package com.hatirlat.backend.repository;

import com.hatirlat.backend.entity.AuditLog;
import com.hatirlat.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    /**
     * Find audit logs by admin user
     */
    Page<AuditLog> findByAdmin(User admin, Pageable pageable);

    /**
     * Find audit logs by action type
     */
    Page<AuditLog> findByAction(String action, Pageable pageable);

    /**
     * Find audit logs for a specific target entity and ID
     */
    Page<AuditLog> findByTargetEntityAndTargetId(
        String targetEntity,
        Long targetId,
        Pageable pageable
    );

    /**
     * Find recent audit logs
     */
    List<AuditLog> findTop100ByOrderByTimestampDesc();

    /**
     * Find audit logs within a time range
     */
    @Query("SELECT al FROM AuditLog al WHERE al.timestamp BETWEEN :startDate AND :endDate ORDER BY al.timestamp DESC")
    Page<AuditLog> findByTimestampBetween(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );

    /**
     * Find all audit logs with pagination (ordered by most recent first)
     */
    Page<AuditLog> findAllByOrderByTimestampDesc(Pageable pageable);

    /**
     * Count audit logs by action
     */
    @Query("SELECT al.action, COUNT(al) FROM AuditLog al GROUP BY al.action")
    List<Object[]> countByAction();

    /**
     * Count audit logs by admin
     */
    @Query("SELECT al.admin.username, COUNT(al) FROM AuditLog al GROUP BY al.admin.username")
    List<Object[]> countByAdmin();
}
