package com.extracenter.backend.entity;

import jakarta.persistence.*;
import lombok.*;
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

    // RELATIONSHIP: Which student is enrolled?
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    // RELATIONSHIP: Which course are they enrolled in?
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // RELATIONSHIP: Does the student have a scholarship for this specific course?
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scholarship_id")
    private Scholarship scholarship;

    // Automatically set the enrollment date to the day the record is created
    private LocalDate enrollmentDate = LocalDate.now();

    // --- GRADES / SCORES ---
    private Float progressScore; // E.g., Mid-term or continuous assessment score
    private Float testScore; // E.g., Standard test score
    private Float finalScore; // E.g., End of course final score

    // Overall performance grade: 'A', 'B', 'C', 'F'
    @Column(length = 1)
    private String performance;
}