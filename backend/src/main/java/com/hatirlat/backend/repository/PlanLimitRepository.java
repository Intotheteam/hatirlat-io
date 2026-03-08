package com.hatirlat.backend.repository;

import com.hatirlat.backend.entity.PlanLimit;
import com.hatirlat.backend.entity.PlanLimitKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlanLimitRepository extends JpaRepository<PlanLimit, Long> {
    Optional<PlanLimit> findByLimitKey(PlanLimitKey limitKey);
}
