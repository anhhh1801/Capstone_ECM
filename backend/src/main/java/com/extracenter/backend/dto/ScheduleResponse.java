package com.extracenter.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalTime;

@Data
@AllArgsConstructor
public class ScheduleResponse {
    private Long courseId;
    private String courseName;
    private Integer dayOfWeek; // 1=Mon, 2=Tue...
    private LocalTime startTime;
    private LocalTime endTime;
    private String roomName; // (Optional) Tạm thời để null hoặc string trống
    private String teacherName;
}