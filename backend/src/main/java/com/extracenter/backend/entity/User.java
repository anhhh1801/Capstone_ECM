package com.extracenter.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "User")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phoneNumber;

    private LocalDate dateOfBirth;

    private String avatarImg;

    @Column(name = "created_date")
    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(columnDefinition = "boolean default false")
    private boolean isLocked = false;

    @Column(nullable = false, unique = true)
    private String personalEmail;

    private boolean isEnabled = false;

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    // --- RELATIONSHIPS ---

    // 1. Course do giáo viên này dạy
    // Nếu xóa Giáo viên -> Giữ lại khóa học (set teacher = null) hoặc xóa khóa học
    // (cascade ALL) tùy nghiệp vụ.
    // Ở đây tôi để CascadeType.ALL theo code cũ của bạn (cẩn thận khi dùng).
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Course> courses;

    // 2. Các khóa học sinh này tham gia (Thông qua Enrollment)
    // CascadeType.ALL + orphanRemoval = true: Xóa User -> Tự động xóa Enrollment
    // liên quan -> Hết lỗi Foreign Key
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Enrollment> enrollments;

    // 3. Các trung tâm mà user thuộc về
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "student_centers", joinColumns = @JoinColumn(name = "student_id"), inverseJoinColumns = @JoinColumn(name = "center_id"))
    @JsonIgnore
    private Set<Center> connectedCenters = new HashSet<>();

    @PreRemove
    private void preRemove() {
        for (Center center : connectedCenters) {
        }
        this.connectedCenters.clear();
    }
}