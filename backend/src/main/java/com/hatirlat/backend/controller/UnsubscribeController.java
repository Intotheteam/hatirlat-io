package com.hatirlat.backend.controller;

import com.hatirlat.backend.dto.BaseResponse;
import com.hatirlat.backend.entity.Member;
import com.hatirlat.backend.service.UnsubscribeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Public unsubscribe endpoints. No auth required: tokens are unguessable per-member secrets.
 */
@RestController
@RequestMapping("/api/public/unsubscribe")
@Tag(name = "Unsubscribe", description = "Self-service unsubscribe via tokenized links")
public class UnsubscribeController {

    private final UnsubscribeService unsubscribeService;

    public UnsubscribeController(UnsubscribeService unsubscribeService) {
        this.unsubscribeService = unsubscribeService;
    }

    @Operation(summary = "Look up unsubscribe target")
    @GetMapping("/{token}")
    public ResponseEntity<BaseResponse<Map<String, Object>>> peek(@PathVariable String token) {
        Member m = unsubscribeService.findByToken(token);
        Map<String, Object> body = Map.of(
                "name", m.getName() != null ? m.getName() : "",
                "email", m.getEmail() != null ? m.getEmail() : "",
                "alreadyUnsubscribed", m.getUnsubscribedAt() != null
        );
        return ResponseEntity.ok(new BaseResponse<>(true, body, null));
    }

    @Operation(summary = "Confirm unsubscribe")
    @PostMapping("/{token}")
    public ResponseEntity<BaseResponse<Void>> confirm(@PathVariable String token) {
        unsubscribeService.unsubscribe(token);
        return ResponseEntity.ok(new BaseResponse<>(true, null, "Aboneliğiniz iptal edildi"));
    }
}
