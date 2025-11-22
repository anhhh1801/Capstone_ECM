package com.extracenter.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;

@Entity
@Table(name = "ClassSlot")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Quy ước: 1=Monday, 2=Tuesday, ... 7=Sunday
    @Column(name = "day_of_week", nullable = false)
    private Integer dayOfWeek;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime; // Ví dụ: 09:00:00

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime; // Ví dụ: 10:30:00

    private Boolean isRecurring = true;

    // RELATIONSHIP: Slot này thuộc khóa học nào?
    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // RELATIONSHIP: Slot này học phòng nào? (Phòng học - Classroom)
    // Tạm thời ta để ID hoặc tạo Entity Classroom sau.
    // Để đơn giản code chạy được ngay, ta map ID phòng học trực tiếp hoặc comment
    // lại nếu chưa tạo Entity Classroom.
    // @ManyToOne
    // @JoinColumn(name = "classroom_id")
    // private Classroom classroom;
}