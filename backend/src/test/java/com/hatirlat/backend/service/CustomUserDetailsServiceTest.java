package com.hatirlat.backend.service;  
import com.hatirlat.backend.entity.User;  
import com.hatirlat.backend.repository.UserRepository;  
import org.junit.jupiter.api.BeforeEach;  
import org.junit.jupiter.api.Test;  
import org.mockito.InjectMocks;  
import org.mockito.Mock;  
import org.mockito.MockitoAnnotations;  
import org.springframework.security.core.userdetails.UserDetails;  
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;  
import static org.mockito.Mockito.*;  
  
class CustomUserDetailsServiceTest {  
    @Mock  
    private UserRepository userRepository;  
    @InjectMocks  
    private CustomUserDetailsService userDetailsService;  
  
    @BeforeEach  
    void setUp() {  
        MockitoAnnotations.openMocks(this);
    }
  
    @Test  
    void loadUserByUsername_ExistingUser_ReturnsUserDetails() {  
        // Arrange  
        String username = "testuser";  
        User mockUser = new User(username, "password", com.hatirlat.backend.entity.Role.USER);  
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(mockUser));  
  
        // Act  
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);  
  
        // Assert  
        assertNotNull(userDetails);  
        assertEquals(username, userDetails.getUsername());
        verify(userRepository).findByUsername(username);  
    } 
  
    @Test  
    void loadUserByUsername_NonExistingUser_ThrowsException() {  
        // Arrange  
        String username = "nonexistent";  
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());
    }
  
} 
