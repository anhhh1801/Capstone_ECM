package com.extracenter.backend.service;

import com.extracenter.backend.entity.User;
import com.extracenter.backend.repository.UserRepository;
import com.extracenter.backend.repository.VerificationTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class UserCleanupScheduler {

    // Best Practice: Use a Logger instead of System.out.println
    private static final Logger logger = LoggerFactory.getLogger(UserCleanupScheduler.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VerificationTokenRepository tokenRepository;

    // Run every day at Midnight (00:00:00) server time
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional // Ensures the token and user deletions happen cleanly together
    public void cleanupUnverifiedUsers() {
        logger.info("🧹 Starting daily cleanup of unverified users...");

        // Calculate time: Target users created more than 24 hours ago
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(24);

        // Fetch the list of users who never verified their email
        List<User> usersToDelete = userRepository.findUnverifiedUsersBefore(cutoffTime);

        if (usersToDelete.isEmpty()) {
            logger.info("No unverified users found to clean up today.");
            return;
        }

        for (User user : usersToDelete) {
            // 1. Delete Token first
            // UPDATE: Since we changed findByUser to return Optional<VerificationToken> in
            // the repository,
            // we use .ifPresent() to safely delete it if it exists.
            tokenRepository.findByUser(user).ifPresent(token -> tokenRepository.delete(token));

            // 2. Delete User
            userRepository.delete(user);
            logger.debug("Deleted unverified user: {}", user.getEmail());
        }

        logger.info("✅ Cleanup complete. Total unverified accounts deleted: {}", usersToDelete.size());
    }
}