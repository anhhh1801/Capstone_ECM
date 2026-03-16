package com.extracenter.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ClassSessionCreateRequest {

    @NotNull(message = "Actor ID is required")
    private Long actorId;

    @NotNull(message = "Session date is required")
    private LocalDate date;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    private String note;
}
