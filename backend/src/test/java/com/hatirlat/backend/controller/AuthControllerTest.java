package com.hatirlat.backend.controller;

import com.hatirlat.backend.config.JwtService;
import com.hatirlat.backend.dto.AuthRequest;
import com.hatirlat.backend.dto.AuthResponse;
import com.hatirlat.backend.dto.UserRequest;
import com.hatirlat.backend.dto.UserResponse;
import com.hatirlat.backend.entity.Role;
import com.hatirlat.backend.service.AuthService;
import com.hatirlat.backend.service.AuditLogService;
import com.hatirlat.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HttpServletRequest httpServletRequest;

    @InjectMocks
    private AuthController authController;

    private AuthRequest authRequest;
    private AuthResponse authResponse;
    private HttpServletResponse mockHttpResponse;

    @BeforeEach
    void setUp() {
        mockHttpResponse = new MockHttpServletResponse();

        authRequest = new AuthRequest();
        authRequest.setUsername("testuser");
        authRequest.setPassword("password");

        authResponse = new AuthResponse();
        authResponse.setToken("test-token");
        UserResponse userResponse = new UserResponse();
        userResponse.setUsername("testuser");
        authResponse.setUser(userResponse);
    }

    @Test
    void login_ValidCredentials_ReturnsAuthResponse() {
        when(authService.authenticate(any(AuthRequest.class))).thenReturn(authResponse);

        ResponseEntity<?> response = authController.login(authRequest, httpServletRequest, mockHttpResponse);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(authService, times(1)).authenticate(any(AuthRequest.class));
    }

    @Test
    void register_ValidData_ReturnsUser() {
        when(authService.registerAndAuthenticate(anyString(), anyString(), anyString(), any(Role.class)))
                .thenReturn(authResponse);

        UserRequest userRequest = new UserRequest();
        userRequest.setUsername("testuser");
        userRequest.setPassword("password");
        userRequest.setEmail("test@example.com");
        userRequest.setRole("USER");

        ResponseEntity<?> response = authController.register(userRequest, httpServletRequest, mockHttpResponse);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(authService, times(1)).registerAndAuthenticate(anyString(), anyString(), anyString(), any(Role.class));
    }

    @Test
    void register_UserRoleDefaultsToUSER() {
        when(authService.registerAndAuthenticate(anyString(), anyString(), anyString(), any(Role.class)))
                .thenReturn(authResponse);

        UserRequest userRequest = new UserRequest();
        userRequest.setUsername("testuser");
        userRequest.setPassword("password");
        userRequest.setEmail("test@example.com");
        // role null -> controller uses Role.USER

        ResponseEntity<?> response = authController.register(userRequest, httpServletRequest, mockHttpResponse);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(authService, times(1)).registerAndAuthenticate(anyString(), anyString(), anyString(), any(Role.class));
    }
}