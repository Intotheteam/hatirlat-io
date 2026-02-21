package com.hatirlat.backend.service;

import com.hatirlat.backend.entity.CreditTransaction;
import com.hatirlat.backend.entity.TransactionType;
import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.exception.InsufficientCreditsException;
import com.hatirlat.backend.repository.CreditTransactionRepository;
import com.hatirlat.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CreditService {

    private final UserRepository userRepository;
    private final CreditTransactionRepository creditTransactionRepository;

    @Autowired
    public CreditService(UserRepository userRepository, CreditTransactionRepository creditTransactionRepository) {
        this.userRepository = userRepository;
        this.creditTransactionRepository = creditTransactionRepository;
    }

    @Transactional
    public void addCredits(User user, int amount, String description) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be greater than 0");
        }

        user.setCredits(user.getCredits() + amount);
        userRepository.save(user);

        CreditTransaction transaction = new CreditTransaction(user, amount, TransactionType.ADD, description);
        creditTransactionRepository.save(transaction);
    }

    @Transactional
    public void deductCredits(User user, int amount, String description) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be greater than 0");
        }

        if (user.getCredits() < amount) {
            throw new InsufficientCreditsException("Yetersiz bakiye. Kredi yüklemeniz gerekiyor.");
        }

        user.setCredits(user.getCredits() - amount);
        userRepository.save(user);

        CreditTransaction transaction = new CreditTransaction(user, amount, TransactionType.DEDUCT, description);
        creditTransactionRepository.save(transaction);
    }

    public int getCreditBalance(User user) {
        return user.getCredits();
    }

    public List<CreditTransaction> getTransactionHistory(User user) {
        return creditTransactionRepository.findByUserOrderByCreatedAtDesc(user);
    }
}
