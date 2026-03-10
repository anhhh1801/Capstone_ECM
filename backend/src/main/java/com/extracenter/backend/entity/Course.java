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

    private String status; // e.g., "ACTIVE", "CLOSED"

    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'ACCEPTED'")
    private String invitationStatus = "ACCEPTED";

    // --- RELATIONSHIPS ---

    // 1. Which center does this course belong to?
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "center_id", nullable = false)
    private Center center;

    // 2. Main teacher assigned to the course
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    // 3. Invited teacher (if the course is pending acceptance by a teacher)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pending_teacher_id")
    private User pendingTeacher;

    // 4. List of enrollments (Replaces the old direct Set<User> students)
    // CascadeType.ALL & orphanRemoval: Deleting a Course safely deletes all
    // associated Enrollments
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Enrollment> enrollments;
}