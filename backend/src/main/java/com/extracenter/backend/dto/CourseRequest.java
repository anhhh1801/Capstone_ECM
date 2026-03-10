package com.extracenter.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class CourseRequest {

    // 1. General Course Information
    @NotBlank(message = "Course name is required")
    private String name;

    @NotBlank(message = "Subject is required")
    private String subject;

    @Min(1)
    @Max(12)
    private Integer grade;

    private String description;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Center ID is required")
    private Long centerId;

    @NotNull(message = "Teacher ID is required")
    private Long teacherId;

    // 2. Schedule Configuration (Used to generate ClassSessions)
    @NotEmpty(message = "At least one time slot is required")
    @Valid
    private List<SlotRequest> slots;

    @Data
    public static class SlotRequest {
        @NotNull(message = "Day of week is required")
        private DayOfWeek dayOfWeek; // Using Enum (MONDAY, TUESDAY, etc.) prevents 1-7 confusion

        @NotNull(message = "Start time is required")
        private LocalTime startTime;

        @NotNull(message = "End time is required")
        private LocalTime endTime;

        // Optional: Add roomId here if students go to specific rooms
        // private Long roomId;
    }
}