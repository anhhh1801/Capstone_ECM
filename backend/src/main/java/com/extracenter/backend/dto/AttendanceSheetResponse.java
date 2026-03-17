package com.extracenter.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.extracenter.backend.entity.AttendanceStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSheetResponse {
    private Long classSessionId;
    private Long courseId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private List<StudentAttendanceRow> students;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentAttendanceRow {
        private Long studentId;
        private String firstName;
        private String lastName;
        private String email;
        private AttendanceStatus status;
        private String note;
    }
}
