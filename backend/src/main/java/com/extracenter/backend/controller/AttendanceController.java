package com.extracenter.backend.controller;

import com.extracenter.backend.dto.AttendanceRequest;
import com.extracenter.backend.entity.Attendance;
import com.extracenter.backend.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "http://localhost:3000")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    // API 1: Lưu điểm danh (POST)
    // http://localhost:8080/api/attendance
    @PostMapping
    public ResponseEntity<?> markAttendance(@RequestBody AttendanceRequest request) {
        try {
            String result = attendanceService.markAttendance(request);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API 2: Xem danh sách điểm danh của một ngày (GET)
    // http://localhost:8080/api/attendance?slotId=1&date=2025-11-20
    @GetMapping
    public ResponseEntity<List<Attendance>> viewAttendance(
            @RequestParam Long slotId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAttendanceList(slotId, date));
    }
}