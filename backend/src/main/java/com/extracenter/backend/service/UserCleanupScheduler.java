package com.extracenter.backend.service;

import com.extracenter.backend.entity.User;
import com.extracenter.backend.entity.VerificationToken;
import com.extracenter.backend.repository.UserRepository;
import com.extracenter.backend.repository.VerificationTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class UserCleanupScheduler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VerificationTokenRepository tokenRepository;

    // Run every day at Midnight (00:00:00)
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional // Ensures delete happens cleanly
    public void cleanupUnverifiedUsers() {
        System.out.println("🧹 Starting cleanup of unverified users...");

        // Calculate time: Delete users created more than 24 hours ago
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(24);

        // You need to add this custom query to UserRepository (see step 3 below)
        List<User> usersToDelete = userRepository.findUnverifiedUsersBefore(cutoffTime);

        for (User user : usersToDelete) {
            // 1. Delete Token first
            VerificationToken token = tokenRepository.findByUser(user);
            if (token != null) {
                tokenRepository.delete(token);
            }
            // 2. Delete User
            userRepository.delete(user);
            System.out.println("Deleted unverified user: " + user.getEmail());
        }
    }
}