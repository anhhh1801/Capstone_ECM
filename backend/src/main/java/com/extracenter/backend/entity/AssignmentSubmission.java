package com.extracenter.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "AssignmentSubmission")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // RELATIONSHIP 1: Nộp cho bài tập nào?
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    // RELATIONSHIP 2: Học sinh nào nộp?
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    // Link file bài làm của học sinh (Từ Cloudinary)
    @Column(nullable = false)
    private String fileUrl;

    @Column(nullable = false)
    private String fileName;

    // Thời gian nộp bài thực tế (Dùng để so sánh với dueDate xem có nộp trễ không)
    @Column(name = "submitted_at", updatable = false)
    private LocalDateTime submittedAt = LocalDateTime.now();

    // --- PHẦN CHẤM ĐIỂM CỦA GIÁO VIÊN ---
    private Float score; // Điểm số (Ví dụ: 8.5, 10)

    @Column(columnDefinition = "TEXT")
    private String feedback; // Lời phê của giáo viên

    // Trạng thái: "SUBMITTED" (Đã nộp), "GRADED" (Đã chấm), "LATE" (Nộp trễ)
    @Column(nullable = false)
    private String status = "SUBMITTED";
}