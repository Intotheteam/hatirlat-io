package com.hatirlat.backend.service;

import com.hatirlat.backend.config.JwtService;
import com.hatirlat.backend.dto.AuthRequest;
import com.hatirlat.backend.dto.AuthResponse;
import com.hatirlat.backend.dto.UserResponse;
import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.entity.Role;
import com.hatirlat.backend.exception.ResourceAlreadyExistsException;
import com.hatirlat.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    public AuthResponse authenticate(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()));
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + request.getUsername()));

        // Generate JWT tokens
        String jwtToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // Create UserResponse object
        UserResponse userResponse = new UserResponse();
        userResponse.setId(String.valueOf(user.getId()));
        userResponse.setUsername(user.getUsername());
        userResponse.setEmail(user.getEmail() != null ? user.getEmail() : "");
        userResponse.setRole(user.getRole().name());
        userResponse.setPremium(user.isPremium());
        userResponse.setCredits(user.getCredits() != null ? user.getCredits() : 0);

        // Create and populate AuthResponse
        AuthResponse authResponse = new AuthResponse();
        authResponse.setToken(jwtToken);
        authResponse.setRefreshToken(refreshToken);
        authResponse.setType("Bearer");
        authResponse.setExpiresIn(86400L); // Token expires in 24 hours (in seconds)
        authResponse.setUser(userResponse);

        return authResponse;
    }

    public AuthResponse registerAndAuthenticate(String username, String password, String email, Role role) {
        // Check if user already exists
        if (userRepository.findByUsername(username).isPresent()) {
            throw new ResourceAlreadyExistsException("User", username);
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResourceAlreadyExistsException("User with email", email);
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setRole(role != null ? role : Role.USER);
        user.setEnabled(true);
        User savedUser = userRepository.save(user);

        // Generate JWT tokens
        String jwtToken = jwtService.generateToken(savedUser);
        String refreshToken = jwtService.generateRefreshToken(savedUser);

        // Create UserResponse
        UserResponse userResponse = new UserResponse();
        userResponse.setId(String.valueOf(savedUser.getId()));
        userResponse.setUsername(savedUser.getUsername());
        userResponse.setEmail(savedUser.getEmail() != null ? savedUser.getEmail() : "");
        userResponse.setRole(savedUser.getRole().name());
        userResponse.setPremium(savedUser.isPremium());
        userResponse.setCredits(savedUser.getCredits() != null ? savedUser.getCredits() : 0);

        // Create AuthResponse
        AuthResponse authResponse = new AuthResponse();
        authResponse.setToken(jwtToken);
        authResponse.setRefreshToken(refreshToken);
        authResponse.setType("Bearer");
        authResponse.setExpiresIn(86400L);
        authResponse.setUser(userResponse);

        return authResponse;
    }
}