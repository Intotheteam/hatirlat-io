package com.hatirlat.backend.config;

import com.hatirlat.backend.entity.Role;
import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create default admin user if not exists
        if (!userRepository.findByUsername("admin").isPresent()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setEmail("admin@hatirlat.io");
            admin.setRole(Role.ADMIN);
            admin.setEnabled(true);
            userRepository.save(admin);
            System.out.println("Created default admin user: admin/admin");
        }
        
        // Create default test user if not exists
        if (!userRepository.findByUsername("test").isPresent()) {
            User testUser = new User();
            testUser.setUsername("test");
            testUser.setPassword(passwordEncoder.encode("test"));
            testUser.setEmail("test@hatirlat.io");
            testUser.setRole(Role.USER);
            testUser.setEnabled(true);
            userRepository.save(testUser);
            System.out.println("Created default test user: test/test");
        }
    }
}