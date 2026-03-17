package com.extracenter.backend.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ClassSessionCreateRequest {

    @NotNull(message = "Actor ID is required")
    private Long actorId;

    @NotNull(message = "Session date is required")
    private LocalDate date;

    @NotNull(message = "Class slot ID is required")
    private Long classSlotId;

    private String note;
}
