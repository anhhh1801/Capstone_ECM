package com.extracenter.backend.dto;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Set;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ClassSlotRequest {

    @NotNull(message = "Manager ID is required")
    private Long managerId;

    @NotNull(message = "Course ID is required")
    private Long courseId;

    private Long classroomId;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotEmpty(message = "At least one day of week is required")
    private Set<DayOfWeek> daysOfWeek;

    private Boolean recurring = true;
}
