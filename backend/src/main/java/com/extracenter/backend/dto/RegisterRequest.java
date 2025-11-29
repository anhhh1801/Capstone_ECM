package com.extracenter.backend.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String firstName;
    private String lastName;
    private String personalEmail;
    private String password;
    private String role; // Frontend gửi lên: "TEACHER" hoặc "STUDENT"
}