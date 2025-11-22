package com.extracenter.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

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

    // Getter & Setter
    public String getInvitationStatus() {
        return invitationStatus;
    }

    public void setInvitationStatus(String invitationStatus) {
        this.invitationStatus = invitationStatus;
    }

    public User getPendingTeacher() {
        return pendingTeacher;
    }

    public void setPendingTeacher(User pendingTeacher) {
        this.pendingTeacher = pendingTeacher;
    }

    // RELATIONSHIP: Course thuộc về 1 Center
    @ManyToOne
    @JoinColumn(name = "center_id", nullable = false)
    private Center center;

    // RELATIONSHIP: Course do 1 Giáo viên dạy (User)
    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    // NGƯỜI ĐANG ĐƯỢC MỜI (Chưa có quyền gì cả, chỉ nhận thông báo)
    @ManyToOne
    @JoinColumn(name = "pending_teacher_id") // Lưu ID người được mời
    private User pendingTeacher;
}