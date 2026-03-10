package com.extracenter.backend.service;

import com.extracenter.backend.dto.MaterialRequest;
import com.extracenter.backend.entity.ClassSession;
import com.extracenter.backend.entity.Course;
import com.extracenter.backend.entity.Material;
import com.extracenter.backend.repository.ClassSessionRepository;
import com.extracenter.backend.repository.CourseRepository;
import com.extracenter.backend.repository.MaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MaterialService {

    @Autowired
    private MaterialRepository materialRepository;
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private ClassSessionRepository classSessionRepository;

    // 1. Upload a new material (Slide, PDF, Video link)
    @Transactional
    public Material uploadMaterial(MaterialRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found!"));

        Material material = new Material();
        material.setFileName(request.getFileName());
        material.setFileUrl(request.getFileUrl()); // URL from Cloudinary/AWS S3
        material.setFileType(request.getFileType());
        material.setCourse(course);

        // If the teacher attaches it to a specific day (e.g. Day 1 Slides)
        if (request.getClassSessionId() != null) {
            ClassSession session = classSessionRepository.findById(request.getClassSessionId())
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