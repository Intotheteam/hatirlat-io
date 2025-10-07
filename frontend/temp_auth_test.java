package com.hatirlat.backend.service;  
  
import com.hatirlat.backend.dto.AuthRequest;  
import com.hatirlat.backend.dto.AuthResponse;  
import com.hatirlat.backend.entity.User;  
import com.hatirlat.backend.entity.Role;  
import com.hatirlat.backend.repository.UserRepository;  
import org.junit.jupiter.api.BeforeEach;  
import org.junit.jupiter.api.Test;  
import org.mockito.InjectMocks;  
import org.mockito.Mock;  
import org.mockito.MockitoAnnotations;  
import org.springframework.security.authentication.AuthenticationManager;  
import org.springframework.security.crypto.password.PasswordEncoder;  
import java.util.Optional;  
  
import static org.junit.jupiter.api.Assertions.*;  
import static org.mockito.ArgumentMatchers.any;  
import static org.mockito.Mockito.*;  
  
class AuthServiceTest { 
  
    @Mock  
    private AuthenticationManager authenticationManager;  
  
    @Mock  
    private UserRepository userRepository;  
  
    @Mock  
    private PasswordEncoder passwordEncoder;  
  
    @InjectMocks  
    private AuthService authService;  
  
    @BeforeEach  
    void setUp() {  
        MockitoAnnotations.openMocks(this);  
    } 
  
    @Test  
    void testAuthenticate_Success() {  
        // Arrange  
        String username = "testuser";  
        String password = "password";  
        AuthRequest request = new AuthRequest(username, password);  
  
        User user = new User(username, password, Role.USER);  
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));  
  
        doNothing(^.when(authenticationManager).authenticate(any(^)));  
  
        // Act  
        AuthResponse response = authService.authenticate(request);  
  
        // Assert  
        assertNotNull(response.getToken(^));  
        assertEquals(user.getRole(^.name(^), response.getRole(^);  
        verify(authenticationManager).authenticate(any(^));  
  
    @Test  
    void testAuthenticate_UserNotFound() {  
        // Arrange  
        String username = "nonexistent";  
        String password = "password";  
        AuthRequest request = new AuthRequest(username, password);  
  
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty(^));  
  
