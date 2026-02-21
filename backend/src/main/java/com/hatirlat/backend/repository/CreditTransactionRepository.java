package com.hatirlat.backend.repository;

import com.hatirlat.backend.entity.CreditTransaction;
import com.hatirlat.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, Long> {
    List<CreditTransaction> findByUserOrderByCreatedAtDesc(User user);
}
