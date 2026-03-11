package com.extracenter.backend.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.extracenter.backend.dto.EnrollmentRequest;
import com.extracenter.backend.entity.Enrollment;
import com.extracenter.backend.service.EnrollmentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(originPatterns = "*") // Allow frontend to communicate with this API
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    // API: Add a student to a course using their email
    // POST: http://localhost:8080/api/enrollments/add-student
    @PostMapping("/add-student")
    public ResponseEntity<?> addStudentToCourse(@Valid @RequestBody EnrollmentRequest request) {
        try {
            Enrollment enrollment = enrollmentService.addStudentToCourse(request);
            // BEST PRACTICE: Return JSON so React handles it cleanly
            return ResponseEntity.ok(Map.of("message", "Success! Added student: " + request.getStudentEmail()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}