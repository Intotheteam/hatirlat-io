package com.hatirlat.backend.repository;

import com.hatirlat.backend.entity.Contact;
import com.hatirlat.backend.entity.Group;
import com.hatirlat.backend.entity.Reminder;
import com.hatirlat.backend.entity.ReminderStatus;
import com.hatirlat.backend.entity.ReminderType;
import com.hatirlat.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    @Query("SELECT r FROM Reminder r WHERE r.status = :status AND r.dateTime <= :dateTime")
    List<Reminder> findByStatusAndDateTimeBefore(ReminderStatus status, LocalDateTime dateTime);

    List<Reminder> findByContact(Contact contact);

    List<Reminder> findByGroup(Group group);

    void deleteByGroup(Group group);

    @Query("SELECT r FROM Reminder r WHERE LOWER(r.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(r.message) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Reminder> searchByTitleOrMessage(@Param("query") String query);

    List<Reminder> findByUser(User user);

    Page<Reminder> findByUser(User user, Pageable pageable);

    @Query("SELECT r FROM Reminder r WHERE r.user = :user AND (LOWER(r.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(r.message) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Reminder> searchByUserAndTitleOrMessage(@Param("user") User user, @Param("query") String query);

    @Query("SELECT r FROM Reminder r WHERE r.user = :user AND (LOWER(r.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(r.message) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Reminder> searchByUserAndTitleOrMessage(@Param("user") User user, @Param("query") String query,
            Pageable pageable);

    long countByUserAndType(User user, ReminderType type);
}