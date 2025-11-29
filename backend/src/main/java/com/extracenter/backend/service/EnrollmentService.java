package com.extracenter.backend.service;

import com.extracenter.backend.dto.EnrollmentRequest;
import com.extracenter.backend.entity.Course;
import com.extracenter.backend.entity.Enrollment;
import com.extracenter.backend.entity.User;
import com.extracenter.backend.repository.CourseRepository;
import com.extracenter.backend.repository.EnrollmentRepository;
import com.extracenter.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private UserService userService;

    // Hàm thêm học viên vào lớp
    public Enrollment addStudentToCourse(EnrollmentRequest request) {
        // 1. Tìm Học viên bằng Email
        User student = userRepository.findByEmail(request.getStudentEmail())
                .orElseThrow(
                        () -> new RuntimeException("Không tìm thấy học viên với email: " + request.getStudentEmail()));

        // 2. Kiểm tra xem user này có đúng là ROLE STUDENT không?
        // (Dùng ignoreCase để tránh lỗi chữ hoa/thường)
        if (!"STUDENT".equalsIgnoreCase(student.getRole().getName())) {
            throw new RuntimeException(
                    "User này không phải là Học viên (STUDENT)! Vai trò hiện tại: " + student.getRole().getName());
        }

        // 3. Tìm Khóa học
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Khóa học không tồn tại với ID: " + request.getCourseId()));

        // 4. Kiểm tra đã học chưa (Tránh thêm 2 lần)
        if (enrollmentRepository.existsByStudentIdAndCourseId(student.getId(), request.getCourseId())) {
            throw new RuntimeException("Học viên này đã có trong lớp rồi!");
        }

        // 5. Lưu đăng ký
        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourse(course);
        enrollment.setEnrollmentDate(LocalDate.now());

        enrollment.setProgressScore(0f);
        enrollment.setTestScore(0f);
        enrollment.setFinalScore(0f);
        enrollment.setPerformance("N/A");

        userService.connectStudentToCenter(student.getId(), course.getCenter().getId());

        return enrollmentRepository.save(enrollment);
    }
}