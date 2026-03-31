package com.extracenter.backend.controller;

import com.extracenter.backend.dto.ScoreRequest;
import com.extracenter.backend.entity.Assignment;
import com.extracenter.backend.entity.AssignmentSubmission;
import com.extracenter.backend.service.AssignmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    @Autowired
    private AssignmentService assignmentService;

    // --- 1. API CHO GIÁO VIÊN TẠO BÀI TẬP ---
    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<?> createAssignment(
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("dueDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dueDate,
            @RequestParam("courseId") Long courseId,
            @RequestParam(value = "classSessionId", required = false) Long classSessionId,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            Assignment assignment = assignmentService.createAssignment(title, description, dueDate, courseId,
                    classSessionId, file);
            return ResponseEntity.status(HttpStatus.CREATED).body(assignment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- 2. LẤY DANH SÁCH BÀI TẬP CỦA KHÓA HỌC ---
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Assignment>> getAssignmentsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsForCourse(courseId));
    }

    // --- 3. API CHO HỌC SINH NỘP BÀI LÀM ---
    @PostMapping(value = "/{assignmentId}/submit", consumes = { "multipart/form-data" })
    public ResponseEntity<?> submitAssignment(
            @PathVariable Long assignmentId,
            @RequestParam("studentId") Long studentId,
            @RequestParam("file") MultipartFile file) {
        try {
            AssignmentSubmission submission = assignmentService.submitAssignment(assignmentId, studentId, file);
            return ResponseEntity.ok(submission);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- 4. API LẤY DANH SÁCH BÀI NỘP CHO GIÁO VIÊN ---
    @GetMapping("/{assignmentId}/submissions")
    public ResponseEntity<List<AssignmentSubmission>> getSubmissions(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(assignmentService.getSubmissionsByAssignment(assignmentId));
    }

    // --- 5. API CHẤM ĐIỂM BÀI NỘP ---
    @PutMapping("/submissions/{submissionId}/grade")
    public ResponseEntity<?> gradeSubmission(
            @PathVariable Long submissionId,
            @Valid @RequestBody ScoreRequest request) {
        try {
            AssignmentSubmission graded = assignmentService.gradeSubmission(submissionId, request);
            return ResponseEntity.ok(graded);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping(value = "/{id}", consumes = { "multipart/form-data" })
    public ResponseEntity<?> updateAssignment(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("dueDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dueDate,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            // Logic Update (Cần tự thêm hàm này vào AssignmentService nhé)
            Assignment updated = assignmentService.updateAssignment(id, title, description, dueDate, file);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- XÓA BÀI TẬP (DELETE) ---
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAssignment(@PathVariable Long id) {
        try {
            assignmentService.deleteAssignment(id); // Cần tự thêm hàm này vào Service
            return ResponseEntity.ok("Deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/student/{studentId}/pending")
    public ResponseEntity<List<Assignment>> getPendingAssignments(@PathVariable Long studentId) {
        return ResponseEntity.ok(assignmentService.getPendingAssignments(studentId));
    }
}