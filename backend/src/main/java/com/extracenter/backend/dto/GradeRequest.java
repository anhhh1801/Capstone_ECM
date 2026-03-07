package com.extracenter.backend.dto;

import lombok.Data;

@Data
public class GradeRequest {
    private String name;
    private Integer value;
    private String description;
}
