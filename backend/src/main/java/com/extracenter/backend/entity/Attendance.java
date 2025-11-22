package com.extracenter.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "Attendance")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // RELATIONSHIP: Điểm danh cho ai (trong khóa học nào)?
    @ManyToOne
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;

    // RELATIONSHIP: Điểm danh cho buổi học nào (Slot)?
    // Ví dụ: Buổi sáng Thứ 2
    @ManyToOne
    @JoinColumn(name = "class_slot_id", nullable = false)
    private ClassSlot classSlot;

    // Ngày thực tế (Ví dụ: Ngày 20/11/2025)
    @Column(nullable = false)
    private LocalDate date;

    private Boolean isPresent; // true = Có mặt, false = Vắng
    private String note; // "Đi muộn", "Có phép"
}