package com.extracenter.backend.dto;

import lombok.Data;

@Data
public class GradeRequest {
    private String name;
    private Integer fromAge;
    private Integer toAge;
    private String description;
}
