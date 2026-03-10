package com.extracenter.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;
import java.time.DayOfWeek;

@Entity
@Table(name = "ClassSlot")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Convention: 1=Monday, 2=Tuesday, ... 7=Sunday
    @Column(name = "day_of_week", nullable = false)
    private DayOfWeek dayOfWeek;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime; // Example: 09:00:00

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime; // Example: 10:30:00

    // Determines if this slot repeats throughout the course duration
    private Boolean isRecurring = true;

    // RELATIONSHIP: Which course does this rule belong to?
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // RELATIONSHIP: Which room is this slot in?
    // Temporarily commented out until Classroom entity is ready
    // @ToString.Exclude
    // @EqualsAndHashCode.Exclude
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "classroom_id")
    // private Classroom classroom;
}