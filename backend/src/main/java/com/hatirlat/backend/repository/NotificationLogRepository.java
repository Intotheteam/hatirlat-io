package com.hatirlat.backend.repository;

import com.hatirlat.backend.entity.NotificationChannel;
import com.hatirlat.backend.entity.NotificationLog;
import com.hatirlat.backend.entity.NotificationLogStatus;
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
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {

    List<NotificationLog> findByUserOrderBySentAtDesc(User user);

    Page<NotificationLog> findByUserOrderBySentAtDesc(User user, Pageable pageable);

    List<NotificationLog> findByUserAndStatus(User user, NotificationLogStatus status);

    Page<NotificationLog> findByReminderIdAndUserOrderBySentAtDesc(Long reminderId, User user, Pageable pageable);

    List<NotificationLog> findByUserAndSentAtBetween(User user, LocalDateTime start, LocalDateTime end);

    long countByUserAndStatus(User user, NotificationLogStatus status);

    /**
     * Count notifications created between two dates (for admin stats)
     */
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Count failed notifications between two dates
     */
    long countByStatusAndCreatedAtBetween(NotificationLogStatus status, LocalDateTime start, LocalDateTime end);

    /**
     * Count notifications by channel between two dates
     */
    long countByChannelAndCreatedAtBetween(NotificationChannel channel, LocalDateTime start, LocalDateTime end);

    /**
     * Count distinct users who used a specific channel
     */
    @Query("SELECT COUNT(DISTINCT nl.user.id) FROM NotificationLog nl WHERE nl.channel = :channel")
    long countDistinctUsersByChannel(@Param("channel") String channel);
}
