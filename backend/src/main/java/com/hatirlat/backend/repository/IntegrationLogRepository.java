package com.hatirlat.backend.repository;

import com.hatirlat.backend.entity.IntegrationLog;
import com.hatirlat.backend.entity.IntegrationProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IntegrationLogRepository extends JpaRepository<IntegrationLog, Long> {

    Page<IntegrationLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<IntegrationLog> findByProviderOrderByCreatedAtDesc(IntegrationProvider provider, Pageable pageable);

    Page<IntegrationLog> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    long countByProvider(IntegrationProvider provider);

    long countByProviderAndStatus(IntegrationProvider provider, String status);

    @Query("SELECT SUM(il.costAmount) FROM IntegrationLog il WHERE il.provider = :provider AND il.status = 'SUCCESS'")
    Object sumCostByProvider(@Param("provider") IntegrationProvider provider);

    @Query("SELECT SUM(il.costAmount) FROM IntegrationLog il WHERE il.costCurrency = :currency AND il.status = 'SUCCESS'")
    Object sumCostByCurrency(@Param("currency") String currency);

    @Query("SELECT SUM(il.costAmount) FROM IntegrationLog il WHERE il.provider = :provider AND il.status = 'SUCCESS' AND il.createdAt >= :from")
    Object sumCostByProviderSince(@Param("provider") IntegrationProvider provider, @Param("from") LocalDateTime from);

    @Query("SELECT SUM(il.costAmount) FROM IntegrationLog il WHERE il.costCurrency = :currency AND il.status = 'SUCCESS' AND il.createdAt >= :from AND il.createdAt < :to")
    Object sumCostByCurrencyBetween(@Param("currency") String currency, @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT il.provider, COUNT(il), COALESCE(SUM(il.costAmount), 0), " +
           "SUM(CASE WHEN il.status = 'SUCCESS' THEN 1 ELSE 0 END) " +
           "FROM IntegrationLog il GROUP BY il.provider")
    List<Object[]> getProviderStats();

    @Query(value = "SELECT CAST(il.created_at AS DATE), il.provider, COUNT(il.id), COALESCE(SUM(il.cost_amount), 0) " +
           "FROM integration_logs il WHERE il.created_at >= :from " +
           "GROUP BY CAST(il.created_at AS DATE), il.provider " +
           "ORDER BY CAST(il.created_at AS DATE) ASC",
           nativeQuery = true)
    List<Object[]> getDailyStatsSince(@Param("from") LocalDateTime from);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT AVG(il.durationMs) FROM IntegrationLog il WHERE il.provider = :provider AND il.status = 'SUCCESS'")
    Double avgDurationByProvider(@Param("provider") IntegrationProvider provider);
}
