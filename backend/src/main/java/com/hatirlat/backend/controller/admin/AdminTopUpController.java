package com.hatirlat.backend.controller.admin;

import com.hatirlat.backend.dto.BaseResponse;
import com.hatirlat.backend.dto.TopUpRequestResponse;
import com.hatirlat.backend.dto.TopUpReviewRequest;
import com.hatirlat.backend.entity.TopUpStatus;
import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.repository.UserRepository;
import com.hatirlat.backend.service.TopUpService;
import com.hatirlat.backend.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Admin endpoints for reviewing and acting on user credit top-up requests.
 */
@RestController
@RequestMapping("/api/admin/topup")
@Tag(name = "Admin TopUp", description = "Credit top-up request approvals for admins")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminTopUpController {

    @Autowired
    private TopUpService topUpService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogService auditLogService;

    private User currentAdmin(Authentication auth) {
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Admin kullanıcı bulunamadı"));
    }

    /** Paginated list of all top-up requests, optionally filtered by status. */
    @GetMapping
    public ResponseEntity<BaseResponse<Page<TopUpRequestResponse>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {

        TopUpStatus statusFilter = null;
        if (status != null && !status.isBlank()) {
            try {
                statusFilter = TopUpStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // invalid status → return all
            }
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<TopUpRequestResponse> result = topUpService.listAll(pageable, statusFilter);
        return ResponseEntity.ok(new BaseResponse<>(true, result, null));
    }

    /** Count of pending requests (for admin badge). */
    @GetMapping("/pending-count")
    public ResponseEntity<BaseResponse<Map<String, Long>>> pendingCount() {
        return ResponseEntity.ok(new BaseResponse<>(true,
                Map.of("count", topUpService.pendingCount()), null));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<BaseResponse<TopUpRequestResponse>> approve(
            @PathVariable Long id,
            @RequestBody(required = false) TopUpReviewRequest review,
            Authentication auth,
            HttpServletRequest httpRequest) {
        User admin = currentAdmin(auth);
        TopUpRequestResponse res = topUpService.approve(id, admin, review);
        auditLogService.logAction(admin, "TOPUP_APPROVED", "TopUpRequest",
                res.getId(),
                Map.of("targetUser", res.getUsername(), "credits", res.getAmount()),
                httpRequest);
        return ResponseEntity.ok(new BaseResponse<>(true, res, "Talep onaylandı, krediler yüklendi"));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<BaseResponse<TopUpRequestResponse>> reject(
            @PathVariable Long id,
            @RequestBody TopUpReviewRequest review,
            Authentication auth,
            HttpServletRequest httpRequest) {
        User admin = currentAdmin(auth);
        TopUpRequestResponse res = topUpService.reject(id, admin, review);
        auditLogService.logAction(admin, "TOPUP_REJECTED", "TopUpRequest",
                res.getId(),
                Map.of(
                        "targetUser", res.getUsername() != null ? res.getUsername() : "",
                        "reason", review.getAdminNote() != null ? review.getAdminNote() : "",
                        "rejectionReason", review.getRejectionReason() != null ? review.getRejectionReason() : ""
                ),
                httpRequest);
        return ResponseEntity.ok(new BaseResponse<>(true, res, "Talep reddedildi"));
    }
}
