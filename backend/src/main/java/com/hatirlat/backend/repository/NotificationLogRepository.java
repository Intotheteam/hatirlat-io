package com.hatirlat.backend.repository;

import com.hatirlat.backend.entity.NotificationLog;
import com.hatirlat.backend.entity.NotificationLogStatus;
import com.hatirlat.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {

    List<NotificationLog> findByUserOrderBySentAtDesc(User user);

    Page<NotificationLog> findByUserOrderBySentAtDesc(User user, Pageable pageable);

    List<NotificationLog> findByUserAndStatus(User user, NotificationLogStatus status);

    List<NotificationLog> findByUserAndSentAtBetween(User user, LocalDateTime start, LocalDateTime end);

    long countByUserAndStatus(User user, NotificationLogStatus status);
}
