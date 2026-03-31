package com.extracenter.backend.dto;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherStudentResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private boolean canManage;
    private List<ConnectedCenterResponse> connectedCenters;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConnectedCenterResponse {
        private Long id;
        private String name;
    }
}