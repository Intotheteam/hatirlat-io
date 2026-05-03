package com.hatirlat.backend.repository;

import com.hatirlat.backend.entity.Role;
import com.hatirlat.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    /**
     * Count users by role
     */
    long countByRole(Role role);

    /**
     * Count premium users
     */
    long countByPremiumTrue();

    /**
     * Count users created between two dates
     */
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Count users with at least one active reminder
     */
    @Query("SELECT COUNT(DISTINCT u) FROM User u JOIN Reminder r ON r.user.id = u.id WHERE r.status = 'SCHEDULED'")
    long countUsersWithActiveReminders();
}