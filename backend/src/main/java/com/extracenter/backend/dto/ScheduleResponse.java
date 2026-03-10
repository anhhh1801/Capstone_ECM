package com.extracenter.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
@Builder
public class ScheduleResponse {
    private Long courseId;
    private Long sessionId; // NEW: ID of the specific session for marking attendance
    private String courseName;
    private String subject; // Added for better UI categorization

    private LocalDate date; // NEW: The specific date (e.g., 2026-03-05)
    private Integer dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;

    private String roomName;
    private String teacherName;
    private String status; // (Optional) e.g., "Scheduled", "Completed", "Cancelled"
}