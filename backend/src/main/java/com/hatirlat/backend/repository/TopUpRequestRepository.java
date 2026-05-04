package com.hatirlat.backend.repository;

import com.hatirlat.backend.entity.TopUpRequest;
import com.hatirlat.backend.entity.TopUpStatus;
import com.hatirlat.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopUpRequestRepository extends JpaRepository<TopUpRequest, Long> {

    List<TopUpRequest> findByUserOrderByRequestedAtDesc(User user);

    Page<TopUpRequest> findByStatusOrderByRequestedAtDesc(TopUpStatus status, Pageable pageable);

    Page<TopUpRequest> findAllByOrderByRequestedAtDesc(Pageable pageable);

    long countByStatus(TopUpStatus status);
}
