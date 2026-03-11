package com.extracenter.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Entity
@Table(name = "VerificationToken")
@Data
@NoArgsConstructor
public class VerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The actual OTP or UUID string
    @Column(nullable = false)
    private String token;

    // RELATIONSHIP: Which user does this token belong to?
    // FetchType.EAGER is used here because when we query a token,
    // we almost always need to know exactly who it belongs to immediately.
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    private User user;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    // Quick constructor to create a token with an automatic 10-minute expiration
    public VerificationToken(User user, String token) {
        this.user = user;
        this.token = token;
        this.expiryDate = LocalDateTime.now().plusMinutes(10);
    }
}