package com.extracenter.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
public class VerificationToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String token; // Chuỗi mã bí mật (ví dụ: abc-123-xyz)

    @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    private User user;

    private LocalDateTime expiryDate;

    // Constructor tạo nhanh token
    public VerificationToken(User user) {
        this.user = user;
        this.token = UUID.randomUUID().toString(); // Tự sinh chuỗi ngẫu nhiên
        this.expiryDate = LocalDateTime.now().plusMinutes(24 * 60); // Hết hạn sau 24h
    }
}