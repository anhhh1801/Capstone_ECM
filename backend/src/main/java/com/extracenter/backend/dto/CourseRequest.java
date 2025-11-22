package com.extracenter.backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class CourseRequest {
    // 1. Thông tin chung của khóa học
    private String name;
    private String subject;
    private Integer grade;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;

    private Long centerId;
    private Long teacherId;

    // 2. Danh sách lịch học (Ví dụ: Thứ 2 - 9h, Thứ 4 - 14h)
    private List<SlotRequest> slots;

    // Class con để định nghĩa Slot
    @Data
    public static class SlotRequest {
        private Integer dayOfWeek; // 1=Monday, ... 7=Sunday
        private LocalTime startTime;
        private LocalTime endTime;
    }
}