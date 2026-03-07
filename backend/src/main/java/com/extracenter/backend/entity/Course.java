package com.extracenter.backend.entity;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

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

    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @ManyToOne
    @JoinColumn(name = "grade_id")
    private Grade grade;

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