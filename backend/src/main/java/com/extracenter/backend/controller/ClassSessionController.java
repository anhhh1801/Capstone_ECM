package com.extracenter.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.extracenter.backend.entity.ClassSession;
import com.extracenter.backend.service.ClassSessionService;

public class ClassSessionController {

    @Autowired
    private ClassSessionService classSessionService;

    @GetMapping("/student/{studentId}/upcoming")
    public ResponseEntity<List<ClassSession>> getUpcomingClasses(@PathVariable Long studentId) {
        return ResponseEntity.ok(classSessionService.getUpcomingByStudent(studentId));
    }
}
