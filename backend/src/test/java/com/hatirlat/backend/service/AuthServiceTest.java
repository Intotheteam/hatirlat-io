package com.hatirlat.backend.service;

import com.hatirlat.backend.config.JwtService;
import com.hatirlat.backend.dto.AuthRequest;
import com.hatirlat.backend.dto.AuthResponse;
import com.hatirlat.backend.dto.UserResponse;
import com.hatirlat.backend.entity.Role;
import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private AuthRequest authRequest;
    private User user;

    @BeforeEach
    void setUp() {
        authRequest = new AuthRequest();
        authRequest.setUsername("testuser");
        authRequest.setPassword("password");

        user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setPassword("encodedPassword");
        user.setRole(Role.USER);
    }

    @Test
    void authenticate_ValidCredentials_ReturnsAuthResponse() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(any(UserDetails.class))).thenReturn("test-jwt-token");
        when(jwtService.generateRefreshToken(any(UserDetails.class))).thenReturn("test-refresh-token");

        AuthResponse response = authService.authenticate(authRequest);

        assertNotNull(response);
        assertEquals("test-jwt-token", response.getToken());
        assertEquals("test-refresh-token", response.getRefreshToken());
        assertNotNull(response.getUser());
        assertEquals("testuser", response.getUser().getUsername());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository, times(1)).findByUsername("testuser");
        verify(jwtService, times(1)).generateToken(any(UserDetails.class));
        verify(jwtService, times(1)).generateRefreshToken(any(UserDetails.class));
    }

    @Test
    void authenticate_UserNotFound_ThrowsException() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            authService.authenticate(authRequest);
        });

        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository, times(1)).findByUsername("testuser");
    }

    @Test
    void register_NewUser_ReturnsSavedUser() {
        when(passwordEncoder.encode("password")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        User registeredUser = authService.register("testuser", "password", "test@example.com", Role.USER);

        assertNotNull(registeredUser);
        assertEquals("testuser", registeredUser.getUsername());
        assertEquals(Role.USER, registeredUser.getRole());
        verify(passwordEncoder, times(1)).encode("password");
        verify(userRepository, times(1)).save(any(User.class));
    }
}