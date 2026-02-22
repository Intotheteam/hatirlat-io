package com.hatirlat.backend.service;

import com.hatirlat.backend.dto.PasswordChangeRequest;
import com.hatirlat.backend.dto.ProfileUpdateRequest;
import com.hatirlat.backend.dto.UserResponse;
import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.exception.ResourceAlreadyExistsException;
import com.hatirlat.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserProfileService {

    private static final Logger logger = LoggerFactory.getLogger(UserProfileService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse getUserProfile(User currentUser) {
        UserResponse response = new UserResponse();
        response.setId(String.valueOf(currentUser.getId()));
        response.setUsername(currentUser.getUsername());
        response.setEmail(currentUser.getEmail());
        response.setRole(currentUser.getRole().name());
        response.setTimezone(currentUser.getTimezone());
        response.setPremium(currentUser.isPremium());
        response.setCredits(currentUser.getCredits() != null ? currentUser.getCredits() : 0);
        return response;
    }

    @Transactional
    public UserResponse updateProfile(User currentUser, ProfileUpdateRequest request) {
        logger.info("Updating profile for user: {}", currentUser.getUsername());

        // Check if username is being changed and is not already taken
        if (request.getUsername() != null && !request.getUsername().equals(currentUser.getUsername())) {
            userRepository.findByUsername(request.getUsername()).ifPresent(existingUser -> {
                if (!existingUser.getId().equals(currentUser.getId())) {
                    throw new ResourceAlreadyExistsException("User", request.getUsername());
                }
            });
            currentUser.setUsername(request.getUsername());
        }

        // Check if email is being changed and is not already taken
        if (request.getEmail() != null && !request.getEmail().equals(currentUser.getEmail())) {
            userRepository.findByEmail(request.getEmail()).ifPresent(existingUser -> {
                if (!existingUser.getId().equals(currentUser.getId())) {
                    throw new ResourceAlreadyExistsException("User with email", request.getEmail());
                }
            });
            currentUser.setEmail(request.getEmail());
        }

        // Update timezone if provided
        if (request.getTimezone() != null && !request.getTimezone().isBlank()) {
            currentUser.setTimezone(request.getTimezone());
        }

        User savedUser = userRepository.save(currentUser);
        logger.info("Profile updated successfully for user: {}", savedUser.getUsername());

        UserResponse response = new UserResponse();
        response.setId(String.valueOf(savedUser.getId()));
        response.setUsername(savedUser.getUsername());
        response.setEmail(savedUser.getEmail());
        response.setRole(savedUser.getRole().name());
        response.setTimezone(savedUser.getTimezone());
        response.setPremium(savedUser.isPremium());
        response.setCredits(savedUser.getCredits() != null ? savedUser.getCredits() : 0);
        return response;
    }

    @Transactional
    public void changePassword(User currentUser, PasswordChangeRequest request) {
        logger.info("Changing password for user: {}", currentUser.getUsername());

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), currentUser.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        // Encode and set new password
        currentUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(currentUser);
        logger.info("Password changed successfully for user: {}", currentUser.getUsername());
    }
}
