package com.hatirlat.backend.repository;

import com.hatirlat.backend.entity.Reminder;
import com.hatirlat.backend.entity.ReminderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    
    @Query("SELECT r FROM Reminder r WHERE r.status = :status AND r.dateTime <= :dateTime")
    List<Reminder> findByStatusAndDateTimeBefore(ReminderStatus status, LocalDateTime dateTime);
}