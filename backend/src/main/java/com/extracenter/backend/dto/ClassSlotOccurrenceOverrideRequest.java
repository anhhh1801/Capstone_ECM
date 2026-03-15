package com.extracenter.backend.dto;

import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ClassSlotOccurrenceOverrideRequest {

    @NotNull(message = "Manager ID is required")
    private Long managerId;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    private Long classroomId;
}
