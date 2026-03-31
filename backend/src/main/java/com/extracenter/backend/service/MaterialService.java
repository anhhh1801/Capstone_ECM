package com.extracenter.backend.service;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.extracenter.backend.entity.ClassSession;
import com.extracenter.backend.entity.Course;
import com.extracenter.backend.entity.Material;
import com.extracenter.backend.repository.ClassSessionRepository;
import com.extracenter.backend.repository.CourseRepository;
import com.extracenter.backend.repository.MaterialRepository;

@Service
public class MaterialService {

    @Autowired
    private MaterialRepository materialRepository;
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private ClassSessionRepository classSessionRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    // 1. Upload a new material (Slide, PDF, Video link) with ACTUAL FILE
    @Transactional
    public Material uploadMaterial(MultipartFile file, Long courseId, Long classSessionId, String fileName)
            throws IOException {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found!"));

        String fileUrl = cloudinaryService.uploadFile(file);

        Material material = new Material();
        if (fileName != null && !fileName.isEmpty()) {
            material.setFileName(fileName);
        } else {
            material.setFileName(file.getOriginalFilename());
        }
        material.setFileName(file.getOriginalFilename()); // get file original name (vd: bai_tap.pdf)
        material.setFileUrl(fileUrl); // URL Cloudinary
        material.setFileType(file.getContentType()); // file (vd: application/pdf)
        material.setCourse(course);

        if (classSessionId != null) {
            ClassSession session = classSessionRepository.findById(classSessionId)
                    .orElseThrow(() -> new RuntimeException("Class session not found!"));
            material.setClassSession(session);
        }

        return materialRepository.save(material);
    }

    // 2. Get general course materials (Syllabus, general rules)
    public List<Material> getGeneralCourseMaterials(Long courseId) {
        return materialRepository.findByCourseIdAndClassSessionIsNull(courseId);
    }

    // 3. Get materials for a specific lesson day
    public List<Material> getMaterialsForSession(Long classSessionId) {
        return materialRepository.findByClassSessionId(classSessionId);
    }

    // 4. Delete a material
    @Transactional
    public void deleteMaterial(Long materialId) {
        materialRepository.deleteById(materialId);
    }
}