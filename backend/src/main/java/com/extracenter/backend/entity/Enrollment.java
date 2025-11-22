package com.extracenter.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "Enrollment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // RELATIONSHIP: Học viên nào?
    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    // RELATIONSHIP: Học khóa nào?
    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // RELATIONSHIP: Có học bổng không? (Có thể null)
    @ManyToOne
    @JoinColumn(name = "scholarship_id")
    private Scholarship scholarship;

    private LocalDate enrollmentDate = LocalDate.now();

    // Điểm số
    private Float progressScore; // Điểm quá trình
    private Float testScore; // Điểm kiểm tra
    private Float finalScore; // Điểm cuối kỳ

    @Column(length = 1)
    private String performance; // A, B, C, F
}