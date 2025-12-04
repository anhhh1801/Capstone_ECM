package com.extracenter.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
    private LocalDateTime createdDate = LocalDateTime.now();

    private String avatarImg;

    // Người quản lý trung tâm
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne
    @JoinColumn(name = "manager_id", nullable = false)
    @JsonIgnoreProperties({ "connectedCenters", "courses", "enrollments", "password", "role" })
    private User manager;
}