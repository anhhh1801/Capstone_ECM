package com.extracenter.backend.controller;

import com.extracenter.backend.dto.AttendanceRequest;
import com.extracenter.backend.entity.Attendance;
import com.extracenter.backend.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
// Optional but highly recommended: Allow your React frontend (e.g.,
// localhost:3000) to talk to this API
@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    // API 1: Mark or Save Attendance (POST)
    // URL: http://localhost:8080/api/attendance
    // ADDED @Valid: This tells Spring to trigger the @NotNull and @NotEmpty rules
    // we put in AttendanceRequest!
    @PostMapping
    public ResponseEntity<?> markAttendance(@Valid @RequestBody AttendanceRequest request) {
        try {
            String result = attendanceService.markAttendance(request);
            // BEST PRACTICE: Returning a JSON object (Map) instead of a raw String.
            // In React, this is easily readable as: response.data.message
            return ResponseEntity.ok(Map.of("message", result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // API 2: View the attendance list for a specific lesson day (GET)
    // ARCHITECTURE UPDATE: Replaced slotId and date with just classSessionId!
    // URL: http://localhost:8080/api/attendance?classSessionId=1
    @GetMapping
    public ResponseEntity<List<Attendance>> viewAttendance(@RequestParam Long classSessionId) {
        return ResponseEntity.ok(attendanceService.getAttendanceList(classSessionId));
    }
}