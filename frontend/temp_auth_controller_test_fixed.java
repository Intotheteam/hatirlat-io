package com.hatirlat.backend.controller;  
import com.hatirlat.backend.dto.AuthRequest;  
import com.hatirlat.backend.dto.AuthResponse;  
import com.hatirlat.backend.service.AuthService;  
import org.junit.jupiter.api.Test;  
import org.springframework.beans.factory.annotation.Autowired;  
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;  
import org.springframework.boot.test.mock.mockito.MockBean;  
import org.springframework.http.MediaType;  
import org.springframework.test.web.servlet.MockMvc;  
import static org.mockito.ArgumentMatchers.any;  
import static org.mockito.Mockito.when;  
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;  
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;  
  
@WebMvcTest(AuthController.class)  
class AuthControllerTest {  
    @Autowired  
    private MockMvc mockMvc;  
    @MockBean  
    private AuthService authService;  
  
    @Test  
    void login_ValidRequest_ReturnsToken() throws Exception {  
        // Arrange  
        AuthRequest request = new AuthRequest(\"testuser\", \"password\");  
        AuthResponse response = new AuthResponse(\"token\", \"USER\");  
        when(authService.authenticate(any(AuthRequest.class))).thenReturn(response);  
        String requestBody = \"{\\\"username\\\":\\\"testuser\\\",\\\"password\\\":\\\"password\\\"}\";  
  
