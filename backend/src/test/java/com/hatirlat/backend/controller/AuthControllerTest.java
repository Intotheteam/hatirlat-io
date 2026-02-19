package com.hatirlat.backend.controller;

import com.hatirlat.backend.dto.AuthRequest;
import com.hatirlat.backend.dto.AuthResponse;
import com.hatirlat.backend.dto.UserRequest;
import com.hatirlat.backend.dto.UserResponse;
import com.hatirlat.backend.entity.Role;
import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private AuthRequest authRequest;
    private AuthResponse authResponse;

    @BeforeEach
    void setUp() {
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

        ResponseEntity<AuthResponse> response = authController.login(authRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("test-token", response.getBody().getToken());
        verify(authService, times(1)).authenticate(any(AuthRequest.class));
    }

    @Test
    void register_ValidData_ReturnsUser() {
        User expectedUser = new User();
        expectedUser.setUsername("testuser");
        expectedUser.setRole(Role.USER);

        when(authService.register(anyString(), anyString(), anyString(), any(Role.class)))
                .thenReturn(expectedUser);

        UserRequest userRequest = new UserRequest();
        userRequest.setUsername("testuser");
        userRequest.setPassword("password");
        userRequest.setEmail("test@example.com");
        userRequest.setRole("USER");

        ResponseEntity<User> response = authController.register(userRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("testuser", response.getBody().getUsername());
        verify(authService, times(1)).register(anyString(), anyString(), anyString(), any(Role.class));
    }

    @Test
    void register_UserRoleDefaultsToUSER() {
        User expectedUser = new User();
        expectedUser.setUsername("testuser");
        expectedUser.setRole(Role.USER);

        when(authService.register(anyString(), anyString(), anyString(), any(Role.class)))
                .thenReturn(expectedUser);

        // role null bırakılınca controller Role.USER kullanır
        UserRequest userRequest = new UserRequest();
        userRequest.setUsername("testuser");
        userRequest.setPassword("password");
        userRequest.setEmail("test@example.com");

        ResponseEntity<User> response = authController.register(userRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("testuser", response.getBody().getUsername());
        verify(authService, times(1)).register(anyString(), anyString(), anyString(), any(Role.class));
    }
}