package com.hatirlat.backend.controller;

import com.hatirlat.backend.dto.BaseResponse;
import com.hatirlat.backend.dto.UserResponse;
import com.hatirlat.backend.entity.Role;
import com.hatirlat.backend.entity.User;
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
        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("testuser");
        mockUser.setEmail("test@example.com");
        mockUser.setRole(Role.USER);

        ResponseEntity<BaseResponse<UserResponse>> response = authController.getCurrentUser(mockUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertNotNull(response.getBody().getData());
        assertEquals("testuser", response.getBody().getData().getUsername());
        assertEquals("USER", response.getBody().getData().getRole());
    }
}
