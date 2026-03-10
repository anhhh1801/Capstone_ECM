package com.extracenter.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "ClassSession")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Which course does this specific session belong to?
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // The exact date of this lesson (e.g., 2025-11-20)
    @Column(nullable = false)
    private LocalDate date;

    // The start and end time for this specific day
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    // STATUS: "SCHEDULED", "COMPLETED", "CANCELLED"
    // Matches your idea: "isOccuring, isCancel"
    @Column(nullable = false)
    private String status = "SCHEDULED";

    // Teacher can add notes: "Make-up class", "Test day", etc.
    private String note;
}