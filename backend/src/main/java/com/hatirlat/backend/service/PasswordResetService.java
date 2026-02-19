package com.hatirlat.backend.service;

import com.hatirlat.backend.entity.PasswordResetToken;
import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.entity.NotificationChannel;
import com.hatirlat.backend.repository.PasswordResetTokenRepository;
import com.hatirlat.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetService.class);
    private static final int TOKEN_EXPIRY_HOURS = 1;

    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public PasswordResetService(PasswordResetTokenRepository tokenRepository,
                                UserRepository userRepository,
                                PasswordEncoder passwordEncoder,
                                NotificationService notificationService) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
    }

    @Transactional
    public void requestPasswordReset(String email) {
        logger.info("Password reset requested for email: {}", email);

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            // Don't reveal whether email exists - always return success
            logger.warn("Password reset requested for non-existent email: {}", email);
            return;
        }

        // Invalidate any existing tokens
        tokenRepository.findByUserAndUsedFalse(user).ifPresent(existingToken -> {
            existingToken.setUsed(true);
            tokenRepository.save(existingToken);
        });

        // Generate a new token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(
                token, user, LocalDateTime.now().plusHours(TOKEN_EXPIRY_HOURS)
        );
        tokenRepository.save(resetToken);

        // Send email with reset link
        String resetLink = frontendUrl + "/reset-password?token=" + token;
        String message = "You have requested a password reset. Click the link below to reset your password:\n\n"
                + resetLink + "\n\nThis link will expire in " + TOKEN_EXPIRY_HOURS + " hour(s).\n"
                + "If you did not request this, please ignore this email.";

        try {
            notificationService.sendNotification(
                    NotificationChannel.EMAIL,
                    email,
                    message,
                    "Password Reset - Hatirlat.io"
            );
            logger.info("Password reset email sent to: {}", email);
        } catch (Exception e) {
            logger.error("Failed to send password reset email to {}: {}", email, e.getMessage());
        }
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        logger.info("Attempting to reset password with token");

        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset token"));

        if (resetToken.isUsed()) {
            throw new IllegalArgumentException("This password reset token has already been used");
        }

        if (resetToken.isExpired()) {
            throw new IllegalArgumentException("This password reset token has expired");
        }

        // Reset the password
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        logger.info("Password reset successfully for user: {}", user.getUsername());
    }
}
