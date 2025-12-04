package com.extracenter.backend.dto;

import lombok.Data;

@Data
public class CenterRequest {
    private String name;
    private String description;
    private String phoneNumber;
    private Long managerId;
}