package com.extracenter.backend.controller;

import com.extracenter.backend.dto.EnrollmentRequest;
import com.extracenter.backend.entity.Enrollment;
import com.extracenter.backend.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "http://localhost:3000")
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    // API: Giáo viên thêm học viên vào lớp
    // POST: http://localhost:8080/api/enrollments/add-student
    @PostMapping("/add-student")
    public ResponseEntity<?> addStudentToCourse(@RequestBody EnrollmentRequest request) {
        try {
            Enrollment enrollment = enrollmentService.addStudentToCourse(request);
            return ResponseEntity.ok("Thành công! Đã thêm học viên: " + request.getStudentEmail());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}