package com.extracenter.backend.service;

import com.extracenter.backend.entity.ClassSession;
import com.extracenter.backend.entity.Course;
import com.extracenter.backend.entity.Material;
import com.extracenter.backend.repository.ClassSessionRepository;
import com.extracenter.backend.repository.CourseRepository;
import com.extracenter.backend.repository.MaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class MaterialService {

    @Autowired
    private MaterialRepository materialRepository;
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private ClassSessionRepository classSessionRepository;

    // TIÊM CLOUDINARY VÀO ĐÂY
    @Autowired
    private CloudinaryService cloudinaryService;

    // 1. Upload a new material (Slide, PDF, Video link) with ACTUAL FILE
    @Transactional
    public Material uploadMaterial(MultipartFile file, Long courseId, Long classSessionId, String fileName)
            throws IOException {
        // 1. Kiểm tra Course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found!"));

        // 2. Gọi Cloudinary để upload file thật và lấy URL về
        String fileUrl = cloudinaryService.uploadFile(file);

        // 3. Tạo Entity
        Material material = new Material();
        if (fileName != null && !fileName.isEmpty()) {
            material.setFileName(fileName);
        } else {
            material.setFileName(file.getOriginalFilename());
        }
        material.setFileName(file.getOriginalFilename()); // Lấy tên file gốc (vd: bai_tap.pdf)
        material.setFileUrl(fileUrl); // URL từ Cloudinary
        material.setFileType(file.getContentType()); // Lấy kiểu file (vd: application/pdf)
        material.setCourse(course);

        // 4. Nếu có gắn với 1 buổi học cụ thể
        if (classSessionId != null) {
            ClassSession session = classSessionRepository.findById(classSessionId)
                    .orElseThrow(() -> new RuntimeException("Class session not found!"));
            material.setClassSession(session);
        }

        // 5. Lưu vào Database
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
        // Mẹo: Bạn có thể viết thêm code gọi Cloudinary xóa file trên mây ở đây nếu
        // muốn
        materialRepository.deleteById(materialId);
    }
}