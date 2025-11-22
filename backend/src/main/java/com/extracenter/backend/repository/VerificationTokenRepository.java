package com.extracenter.backend.repository;

import com.extracenter.backend.entity.VerificationToken;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    // Tìm Token object dựa vào chuỗi mã (ví dụ: "abc-123-xyz")
    VerificationToken findByToken(String token);

    // Tìm tất cả token mà thời gian hết hạn < thời gian hiện tại (nghĩa là đã hết
    // hạn)
    List<VerificationToken> findAllByExpiryDateBefore(LocalDateTime now);
}