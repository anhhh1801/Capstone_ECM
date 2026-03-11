package com.extracenter.backend.dto;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CourseRequest {

    @NotBlank(message = "Course name is required")
    private String name;

    private Long subjectId;

    private Long gradeId;

    private String description;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Center ID is required")
    private Long centerId;

    @NotNull(message = "Teacher ID is required")
    private Long teacherId;

    @NotEmpty(message = "At least one time slot is required")
    @Valid
    private List<SlotRequest> slots;

    @Data
    public static class SlotRequest {

        @NotNull(message = "Day of week is required")
        private DayOfWeek dayOfWeek;

        @NotNull(message = "Start time is required")
        private LocalTime startTime;

        @NotNull(message = "End time is required")
        private LocalTime endTime;
    }
}