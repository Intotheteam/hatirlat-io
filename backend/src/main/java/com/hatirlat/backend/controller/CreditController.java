package com.hatirlat.backend.controller;

import com.hatirlat.backend.dto.CreditRequest;
import com.hatirlat.backend.entity.CreditTransaction;
import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.exception.InsufficientCreditsException;
import com.hatirlat.backend.repository.UserRepository;
import com.hatirlat.backend.service.CreditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/credits")
@CrossOrigin(origins = "*") // Adjust in production
public class CreditController {

    private final CreditService creditService;
    private final UserRepository userRepository;

    @Autowired
    public CreditController(CreditService creditService, UserRepository userRepository) {
        this.creditService = creditService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
    }

    @GetMapping("/balance")
    public ResponseEntity<Map<String, Integer>> getBalance(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        int balance = creditService.getCreditBalance(user);

        Map<String, Integer> response = new HashMap<>();
        response.put("credits", balance);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<CreditTransaction>> getHistory(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        List<CreditTransaction> history = creditService.getTransactionHistory(user);
        return ResponseEntity.ok(history);
    }

    // This is essentially a mock payment endpoint for now.
    // In a real application, you would integrate a payment gateway (e.g., Stripe,
    // Iyzico).
    @PostMapping("/add")
    public ResponseEntity<Map<String, String>> addCredits(@RequestBody CreditRequest request,
            Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        creditService.addCredits(user, request.getAmount(), "Kredi Yükleme (Paket Alımı)");

        Map<String, String> response = new HashMap<>();
        response.put("message", request.getAmount() + " kredi başarıyla yüklendi.");

        return ResponseEntity.ok(response);
    }

    // Endpoint for manual deduction test, though normally services will call
    // deductCredits directly
    @PostMapping("/use")
    public ResponseEntity<Map<String, String>> useCredits(@RequestBody CreditRequest request,
            Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        try {
            creditService.deductCredits(user, request.getAmount(), "Manuel Kredi Kullanımı");
            Map<String, String> response = new HashMap<>();
            response.put("message", request.getAmount() + " kredi başarıyla kullanıldı.");
            return ResponseEntity.ok(response);
        } catch (InsufficientCreditsException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
