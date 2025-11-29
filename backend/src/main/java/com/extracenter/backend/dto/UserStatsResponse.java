package com.extracenter.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserStatsResponse {
    private Long userId;
    private long totalCenters;
    private long totalCourses;
    private long totalStudents;
}