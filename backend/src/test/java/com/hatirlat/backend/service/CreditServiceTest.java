package com.hatirlat.backend.service;

import com.hatirlat.backend.entity.CreditTransaction;
import com.hatirlat.backend.entity.Role;
import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.exception.InsufficientCreditsException;
import com.hatirlat.backend.repository.CreditTransactionRepository;
import com.hatirlat.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CreditServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CreditTransactionRepository creditTransactionRepository;

    @InjectMocks
    private CreditService creditService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User("testuser", "password123", Role.USER);
        testUser.setId(1L);
        testUser.setCredits(10); // Default given in entity
    }

    @Test
    void testAddCredits_Success() {
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(creditTransactionRepository.save(any(CreditTransaction.class))).thenReturn(new CreditTransaction());

        creditService.addCredits(testUser, 50, "Test Add");

        assertEquals(60, testUser.getCredits());
        verify(userRepository, times(1)).save(testUser);
        verify(creditTransactionRepository, times(1)).save(any(CreditTransaction.class));
    }

    @Test
    void testAddCredits_InvalidAmount() {
        assertThrows(IllegalArgumentException.class, () -> {
            creditService.addCredits(testUser, -10, "Test Add Negative");
        });
    }

    @Test
    void testDeductCredits_Success() {
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(creditTransactionRepository.save(any(CreditTransaction.class))).thenReturn(new CreditTransaction());

        creditService.deductCredits(testUser, 5, "Test Deduct");

        assertEquals(5, testUser.getCredits());
        verify(userRepository, times(1)).save(testUser);
        verify(creditTransactionRepository, times(1)).save(any(CreditTransaction.class));
    }

    @Test
    void testDeductCredits_InsufficientBalance() {
        assertThrows(InsufficientCreditsException.class, () -> {
            creditService.deductCredits(testUser, 15, "Test Deduct Too Much");
        });
    }
}
