package com.extracenter.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MaterialRequest {
    @NotBlank(message = "File name is required")
    private String fileName;

    @NotBlank(message = "File URL is required")
    private String fileUrl;

    @NotBlank(message = "File type is required (e.g., PDF, DOCX, LINK)")
    private String fileType;

    @NotNull(message = "Course ID is required")
    private Long courseId;

    // Optional: Only used if the material is for a specific lesson day
    private Long classSessionId;
}