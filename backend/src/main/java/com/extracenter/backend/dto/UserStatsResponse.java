package com.extracenter.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class UserStatsResponse {
    private Long userId;

    // Management Stats
    private long totalCenters;
    private long totalCourses;
    private long totalStudents;
    private long totalTeachers;

    // Operational Stats (For the current week/day)
    private long activeEnrollments;
    private long classesToday;

    // Performance Stats (Optional)
    private Double averageAttendanceRate;
}