package com.extracenter.backend.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class CourseStatusConverter implements AttributeConverter<CourseStatus, String> {

    @Override
    public String convertToDatabaseColumn(CourseStatus attribute) {
        return attribute == null ? CourseStatus.UPCOMING.name() : attribute.name();
    }

    @Override
    public CourseStatus convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return CourseStatus.UPCOMING;
        }

        return switch (dbData.trim().toUpperCase()) {
            case "UPCOMING" -> CourseStatus.UPCOMING;
            case "IN_PROGRESS", "INPROCESS", "ACTIVE" -> CourseStatus.IN_PROGRESS;
            case "ENDED", "CLOSED" -> CourseStatus.ENDED;
            default -> CourseStatus.UPCOMING;
        };
    }
}