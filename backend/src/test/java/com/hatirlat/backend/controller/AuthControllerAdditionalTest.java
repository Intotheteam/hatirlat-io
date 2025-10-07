package com.hatirlat.backend.controller;

import com.hatirlat.backend.dto.BaseResponse;
import com.hatirlat.backend.dto.UserResponse;
import com.hatirlat.backend.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerAdditionalTest {

    @InjectMocks
    private AuthController authController;

    @Test
    void getCurrentUser_ReturnsCurrentUser() {
        ResponseEntity<BaseResponse<UserResponse>> response = authController.getCurrentUser();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertNotNull(response.getBody().getData());
        assertEquals("currentuser", response.getBody().getData().getUsername());
        assertEquals("USER", response.getBody().getData().getRole());
    }
}