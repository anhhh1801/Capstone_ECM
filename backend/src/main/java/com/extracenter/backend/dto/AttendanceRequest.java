package com.extracenter.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class AttendanceRequest {

    // ARCHITECTURE UPDATE: Replaced classSlotId and date with classSessionId
    @NotNull(message = "Class session ID is required")
    private Long classSessionId;

    @NotEmpty(message = "Student attendance list cannot be empty")
    @Valid // Tells Spring to also validate the objects inside this list
    private List<StudentStatus> studentStatuses;

    @Data
    public static class StudentStatus {

        @NotNull(message = "Student ID is required")
        private Long studentId;

        @NotNull(message = "Attendance status (isPresent) is required")
        private Boolean isPresent; // true = present, false = absent

        private String note; // Optional: "Late", "Excused absence", etc.
    }
}