package com.hatirlat.backend.service;

import com.hatirlat.backend.config.JwtService;
import com.hatirlat.backend.dto.AuthRequest;
import com.hatirlat.backend.dto.AuthResponse;
import com.hatirlat.backend.dto.UserResponse;
import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.entity.Role;
import com.hatirlat.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
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
                        request.getPassword()
                ));
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Generate JWT tokens
        String jwtToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        
        // Create UserResponse object
        UserResponse userResponse = new UserResponse();
        userResponse.setId(String.valueOf(user.getId()));
        userResponse.setUsername(user.getUsername());
        userResponse.setEmail(user.getEmail() != null ? user.getEmail() : "");
        userResponse.setRole(user.getRole().name());
        
        // Create and populate AuthResponse
        AuthResponse authResponse = new AuthResponse();
        authResponse.setToken(jwtToken);
        authResponse.setRefreshToken(refreshToken);
        authResponse.setType("Bearer");
        authResponse.setExpiresIn(86400L); // Token expires in 24 hours (in seconds)
        authResponse.setUser(userResponse);
        
        return authResponse;
    }

    public User register(String username, String password, String email, Role role) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setRole(role != null ? role : Role.USER); // Default to USER role if not provided
        user.setEnabled(true);
        return userRepository.save(user);
    }
}