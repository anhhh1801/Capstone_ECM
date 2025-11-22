package com.extracenter.backend.repository;

import com.extracenter.backend.entity.Enrollment;
import com.extracenter.backend.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    // 1. Kiểm tra xem học viên đã đăng ký khóa này chưa (Dùng khi Add Student)
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);

    // 2. Lấy danh sách các lớp mà học viên đang học (Dùng khi hiển thị Lịch)
    List<Enrollment> findByStudentId(Long studentId);

    // 3. Tìm chính xác Enrollment dựa vào Student ID và Course ID
    // (Dùng cái này trong AttendanceService sẽ nhanh hơn cách stream)
    Optional<Enrollment> findByStudentIdAndCourseId(Long studentId, Long courseId);

    // 4. (Tùy chọn) Lấy danh sách học viên của 1 khóa để giáo viên xem
    List<Enrollment> findByCourseId(Long courseId);

    // Query: Tìm tất cả User (Student) có đăng ký vào các khóa học thuộc Center ID
    // này
    // Dùng DISTINCT để tránh trùng lặp (1 em học 2 môn Toán, Lý thì chỉ hiện 1 lần)
    @Query("SELECT DISTINCT e.student FROM Enrollment e WHERE e.course.center.id = :centerId")
    List<User> findStudentsByCenterId(@Param("centerId") Long centerId);
}