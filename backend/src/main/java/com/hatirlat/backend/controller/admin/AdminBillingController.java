package com.hatirlat.backend.controller.admin;

import com.hatirlat.backend.dto.BaseResponse;
import com.hatirlat.backend.dto.admin.*;
import com.hatirlat.backend.entity.IntegrationLog;
import com.hatirlat.backend.entity.IntegrationProvider;
import com.hatirlat.backend.repository.IntegrationLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/billing")
@Tag(name = "Admin Billing", description = "Integration cost tracking and billing stats")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBillingController {

    private static final Logger logger = LoggerFactory.getLogger(AdminBillingController.class);

    @Autowired
    private IntegrationLogRepository integrationLogRepository;

    private static final Map<IntegrationProvider, String> DISPLAY_NAMES = Map.of(
        IntegrationProvider.NETGSM,          "Netgsm SMS",
        IntegrationProvider.ILETIMERKEZI,    "İleti Merkezi SMS",
        IntegrationProvider.TWILIO_SMS,       "Twilio SMS",
        IntegrationProvider.TWILIO_WHATSAPP,  "Twilio WhatsApp",
        IntegrationProvider.SMTP,             "E-posta (SMTP)"
    );

    private static final Map<IntegrationProvider, String> CHANNELS = Map.of(
        IntegrationProvider.NETGSM,          "SMS",
        IntegrationProvider.ILETIMERKEZI,    "SMS",
        IntegrationProvider.TWILIO_SMS,       "SMS",
        IntegrationProvider.TWILIO_WHATSAPP,  "WHATSAPP",
        IntegrationProvider.SMTP,             "EMAIL"
    );

    @GetMapping("/overview")
    @Operation(summary = "Get billing overview with per-provider stats and 30-day daily chart")
    public ResponseEntity<BaseResponse<BillingOverviewResponse>> getOverview() {
        BillingOverviewResponse response = new BillingOverviewResponse();

        response.setTotalRequests(safeCount(() -> integrationLogRepository.count()));

        // Count success/failed across all providers
        long successTotal = 0, failedTotal = 0;
        for (IntegrationProvider p : IntegrationProvider.values()) {
            successTotal += safeCount(() -> integrationLogRepository.countByProviderAndStatus(p, "SUCCESS"));
            failedTotal  += safeCount(() -> integrationLogRepository.countByProviderAndStatus(p, "FAILED"));
        }
        response.setTotalSuccessful(successTotal);
        response.setTotalFailed(failedTotal);

        // All-time cost totals
        response.setTotalCostTry(safeSum(() -> integrationLogRepository.sumCostByCurrency("TRY")));
        response.setTotalCostUsd(safeSum(() -> integrationLogRepository.sumCostByCurrency("USD")));

        // This month costs
        LocalDateTime monthStart = LocalDateTime.now()
            .withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime now = LocalDateTime.now();
        response.setMonthCostTry(safeSum(() -> integrationLogRepository.sumCostByCurrencyBetween("TRY", monthStart, now)));
        response.setMonthCostUsd(safeSum(() -> integrationLogRepository.sumCostByCurrencyBetween("USD", monthStart, now)));

        // Per-provider stats
        response.setProviders(buildProviderStats());

        // 30-day daily chart
        response.setDailyStats(buildDailyStats());

        return ResponseEntity.ok(new BaseResponse<>(true, response, "Billing overview retrieved"));
    }

    @GetMapping("/logs")
    @Operation(summary = "Get paginated integration logs")
    public ResponseEntity<BaseResponse<PagedResponse<IntegrationLogResponse>>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String provider,
            @RequestParam(required = false) String status) {

        Pageable pageable = PageRequest.of(page, size);
        Page<IntegrationLog> logs;

        if (provider != null && !provider.isBlank()) {
            try {
                IntegrationProvider p = IntegrationProvider.valueOf(provider.toUpperCase());
                logs = integrationLogRepository.findByProviderOrderByCreatedAtDesc(p, pageable);
            } catch (IllegalArgumentException e) {
                logs = integrationLogRepository.findAllByOrderByCreatedAtDesc(pageable);
            }
        } else if (status != null && !status.isBlank()) {
            logs = integrationLogRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase(), pageable);
        } else {
            logs = integrationLogRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        Page<IntegrationLogResponse> mapped = logs.map(IntegrationLogResponse::fromEntity);
        PagedResponse<IntegrationLogResponse> paged = new PagedResponse<>(
            mapped.getContent(), mapped.getTotalElements(), mapped.getTotalPages(),
            mapped.getNumber(), mapped.getSize()
        );

        return ResponseEntity.ok(new BaseResponse<>(true, paged, "Logs retrieved"));
    }

    @GetMapping("/providers")
    @Operation(summary = "Get per-provider stats only")
    public ResponseEntity<BaseResponse<List<ProviderStatsResponse>>> getProviderStats() {
        return ResponseEntity.ok(new BaseResponse<>(true, buildProviderStats(), "Provider stats retrieved"));
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    private List<ProviderStatsResponse> buildProviderStats() {
        List<ProviderStatsResponse> result = new ArrayList<>();
        for (IntegrationProvider p : IntegrationProvider.values()) {
            ProviderStatsResponse stat = new ProviderStatsResponse();
            stat.setProvider(p.name());
            stat.setDisplayName(DISPLAY_NAMES.getOrDefault(p, p.name()));
            stat.setChannel(CHANNELS.getOrDefault(p, "UNKNOWN"));

            long total    = safeCount(() -> integrationLogRepository.countByProvider(p));
            long success  = safeCount(() -> integrationLogRepository.countByProviderAndStatus(p, "SUCCESS"));
            long failed   = safeCount(() -> integrationLogRepository.countByProviderAndStatus(p, "FAILED"));
            long disabled = safeCount(() -> integrationLogRepository.countByProviderAndStatus(p, "DISABLED"));

            stat.setTotalRequests(total);
            stat.setSuccessCount(success);
            stat.setFailedCount(failed);
            stat.setDisabledCount(disabled);
            stat.setSuccessRate(total > 0 ? (double) success / total * 100.0 : 0.0);
            stat.setTotalCost(safeSum(() -> integrationLogRepository.sumCostByProvider(p)));
            stat.setCurrency((p == IntegrationProvider.NETGSM || p == IntegrationProvider.ILETIMERKEZI) ? "TRY" : "USD");

            try {
                Double avg = integrationLogRepository.avgDurationByProvider(p);
                stat.setAvgDurationMs(avg != null ? avg : 0.0);
            } catch (Exception e) {
                stat.setAvgDurationMs(0.0);
            }
            result.add(stat);
        }
        return result;
    }

    private List<BillingOverviewResponse.DailyBillingStats> buildDailyStats() {
        try {
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
            List<Object[]> daily = integrationLogRepository.getDailyStatsSince(thirtyDaysAgo);
            return daily.stream()
                .map(row -> {
                    String date     = row[0] != null ? row[0].toString() : "";
                    String provider = row[1] != null ? row[1].toString() : "";
                    long count      = row[2] != null ? ((Number) row[2]).longValue() : 0L;
                    BigDecimal cost;
                    try {
                        cost = row[3] != null
                            ? new BigDecimal(row[3].toString()).setScale(6, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;
                    } catch (Exception e) {
                        cost = BigDecimal.ZERO;
                    }
                    return new BillingOverviewResponse.DailyBillingStats(date, provider, count, cost);
                })
                .collect(Collectors.toList());
        } catch (Exception e) {
            logger.warn("Could not load daily billing stats: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    /** Safely executes a count query, returning 0 on any error. */
    private long safeCount(CountSupplier s) {
        try { return s.get(); } catch (Exception e) {
            logger.warn("Count query failed: {}", e.getMessage());
            return 0L;
        }
    }

    /** Safely executes a SUM query — handles null, Integer, Long, Double, BigDecimal returns. */
    private BigDecimal safeSum(SumSupplier s) {
        try {
            Object raw = s.get();
            if (raw == null) return BigDecimal.ZERO;
            if (raw instanceof BigDecimal bd) return bd.setScale(6, RoundingMode.HALF_UP);
            return new BigDecimal(raw.toString()).setScale(6, RoundingMode.HALF_UP);
        } catch (Exception e) {
            logger.warn("Sum query failed: {}", e.getMessage());
            return BigDecimal.ZERO;
        }
    }

    @FunctionalInterface interface CountSupplier { long get() throws Exception; }
    @FunctionalInterface interface SumSupplier   { Object get() throws Exception; }
}
