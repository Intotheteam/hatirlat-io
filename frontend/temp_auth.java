package com.hatirlat.backend.service;  
import com.hatirlat.backend.dto.AuthRequest;  
import com.hatirlat.backend.dto.AuthResponse;  
import com.hatirlat.backend.entity.User;  
import com.hatirlat.backend.entity.Role;  
import com.hatirlat.backend.repository.UserRepository;  
import org.springframework.beans.factory.annotation.Autowired;  
import org.springframework.security.authentication.AuthenticationManager;  
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;  
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
  
    public AuthResponse authenticate(AuthRequest request) {  
        authenticationManager.authenticate(  
                new UsernamePasswordAuthenticationToken(  
                        request.getUsername(^),  
                        request.getPassword(^)  
                ));  
  
        User user = userRepository.findByUsername(request.getUsername(^))  
                .orElseThrow(() - RuntimeException("User not found"));  
  
        // In a real application, you would generate and return a JWT token here  
        // For now, we'll return a placeholder  
        String token = "PLACEHOLDER_TOKEN_" + System.currentTimeMillis(^);  
        return new AuthResponse(token, user.getRole(^.name(^));  
    } 
