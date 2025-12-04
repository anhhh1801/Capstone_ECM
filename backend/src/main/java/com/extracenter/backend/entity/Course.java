package com.extracenter.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "Course")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String subject;
    private Integer grade;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate startDate;
    private LocalDate endDate;

    private String status; // ACTIVE, CLOSED

    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'ACCEPTED'")
    private String invitationStatus = "ACCEPTED";

    // --- RELATIONSHIPS ---

    // 1. Thuộc trung tâm nào
    @ManyToOne
    @JoinColumn(name = "center_id", nullable = false)
    private Center center;

    // 2. Giáo viên chính
    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    // 3. Giáo viên được mời (pending)
    @ManyToOne
    @JoinColumn(name = "pending_teacher_id")
    private User pendingTeacher;

    // 4. Danh sách đăng ký học (Thay thế cho Set<User> students cũ)
    // Xóa Course -> Xóa luôn Enrollment
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Enrollment> enrollments;
}