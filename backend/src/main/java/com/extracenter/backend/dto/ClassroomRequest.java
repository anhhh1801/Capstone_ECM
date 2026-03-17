package com.extracenter.backend.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ClassroomRequest {

    @NotNull(message = "Seat is required")
    @Min(value = 1, message = "Seat must be at least 1")
    private Integer seat;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Last maintain date is required")
    private LocalDate lastMaintainDate;

    @NotNull(message = "Manager ID is required")
    private Long managerId;
}
