package com.hatirlat.backend.controller;

import com.hatirlat.backend.dto.BaseResponse;
import com.hatirlat.backend.dto.TopUpRequestCreate;
import com.hatirlat.backend.dto.TopUpRequestResponse;
import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.repository.UserRepository;
import com.hatirlat.backend.service.TopUpService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Endpoints for end-users to submit and view their own credit top-up requests.
 * All endpoints require authentication (USER or ADMIN).
 */
@RestController
@RequestMapping("/api/topup")
public class TopUpController {

    @Autowired
    private TopUpService topUpService;

    @Autowired
    private UserRepository userRepository;

    private User currentUser(Authentication auth) {
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
    }

    /** Submit a new top-up request. */
    @PostMapping
    public ResponseEntity<BaseResponse<TopUpRequestResponse>> create(
            @Valid @RequestBody TopUpRequestCreate dto,
            Authentication auth) {
        User user = currentUser(auth);
        TopUpRequestResponse res = topUpService.createRequest(user, dto);
        return ResponseEntity.ok(new BaseResponse<>(true, res, "Talep oluşturuldu"));
    }

    /** List my own top-up requests. */
    @GetMapping
    public ResponseEntity<BaseResponse<List<TopUpRequestResponse>>> mine(Authentication auth) {
        User user = currentUser(auth);
        return ResponseEntity.ok(new BaseResponse<>(true, topUpService.listForUser(user), null));
    }

    /** Mark a pending request as paid (after I sent the bank transfer, etc). */
    @PostMapping("/{id}/mark-paid")
    public ResponseEntity<BaseResponse<TopUpRequestResponse>> markPaid(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            Authentication auth) {
        User user = currentUser(auth);
        String reference = body != null ? body.get("paymentReference") : null;
        TopUpRequestResponse res = topUpService.markPaymentDone(id, user, reference);
        return ResponseEntity.ok(new BaseResponse<>(true, res, "Ödeme bilgisi kaydedildi"));
    }
}
