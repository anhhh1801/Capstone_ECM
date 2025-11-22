package com.extracenter.backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class AttendanceRequest {
    private Long classSlotId; // Điểm danh cho slot lịch nào (Ví dụ: Slot sáng thứ 2)
    private LocalDate date; // Ngày điểm danh (Ví dụ: 2025-11-20)

    private List<StudentStatus> studentStatuses;

    @Data
    public static class StudentStatus {
        private Long studentId;
        private Boolean isPresent; // true = có mặt, false = vắng
        private String note; // "Đi muộn", "Có phép"...
    }
}