package com.extracenter.backend.controller;

import com.extracenter.backend.entity.Material;
import com.extracenter.backend.service.MaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/materials")
public class MaterialController {

    @Autowired
    private MaterialService materialService;

    // API Upload File (Chú ý: consumes = multipart/form-data)
    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<?> uploadMaterial(
            @RequestParam("file") MultipartFile file,
            @RequestParam("courseId") Long courseId,
            @RequestParam(value = "classSessionId", required = false) Long classSessionId,
            @RequestParam(value = "fileName", required = false) String fileName) {
        try {
            Material savedMaterial = materialService.uploadMaterial(file, courseId, classSessionId, fileName);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedMaterial);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Lấy tài liệu chung của khóa học
    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getCourseMaterials(@PathVariable Long courseId) {
        return ResponseEntity.ok(materialService.getGeneralCourseMaterials(courseId));
    }

    // Lấy tài liệu của một buổi học cụ thể
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<?> getSessionMaterials(@PathVariable Long sessionId) {
        return ResponseEntity.ok(materialService.getMaterialsForSession(sessionId));
    }

    // Xóa tài liệu
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return ResponseEntity.ok("Material deleted successfully");
    }
}