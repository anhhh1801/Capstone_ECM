package com.extracenter.backend.dto;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CourseSessionSlotOptionResponse {
    private Long classSlotId;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Set<DayOfWeek> daysOfWeek;
    private Long classroomId;
    private String classroomLocation;
}
