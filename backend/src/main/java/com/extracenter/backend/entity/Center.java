package com.extracenter.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "Center")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Center {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String phoneNumber;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate = LocalDateTime.now(); // Tự động lấy giờ hiện tại

    private String avatarImg;

    // RELATIONSHIP: Một Center có 1 người quản lý (User)
    // Chúng ta map cột manager_id trong database
    @ManyToOne
    @JoinColumn(name = "manager_id", nullable = false)
    private User manager;
}