package com.extracenter.backend.repository;

import com.extracenter.backend.entity.User;
import com.extracenter.backend.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {

    // Find the Token object based on the exact string (e.g., "abc-123-xyz" or a
    // 6-digit OTP)
    // OPTIMIZED: Changed to Optional to prevent NullPointerExceptions if the user
    // types a wrong token.
    Optional<VerificationToken> findByToken(String token);

    // Find all tokens where the expiry date is before the given time (i.e., expired
    // tokens).
    // Used by a scheduled task to clean up old, unused tokens from the database.
    List<VerificationToken> findAllByExpiryDateBefore(LocalDateTime now);

    // Find the active verification token for a specific user.
    // OPTIMIZED: Changed to Optional for null safety.
    Optional<VerificationToken> findByUser(User user);
}