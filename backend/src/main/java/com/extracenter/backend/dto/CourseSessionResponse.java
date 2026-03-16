package com.extracenter.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CourseSessionResponse {
    private Long id;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
    private String note;
    private Long classSlotId;
    private Long classroomId;
    private String classroomLocation;
}
