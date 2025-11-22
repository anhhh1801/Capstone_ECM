package com.extracenter.backend.dto;

import lombok.Data;

@Data
public class EnrollmentRequest {
    private String studentEmail; // Giáo viên nhập email học viên
    private Long courseId; // ID khóa học muốn thêm vào
}