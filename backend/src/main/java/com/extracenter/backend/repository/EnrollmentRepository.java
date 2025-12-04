package com.extracenter.backend.repository;

import com.extracenter.backend.entity.Enrollment;
import com.extracenter.backend.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    // 1. Kiểm tra xem học viên đã đăng ký khóa này chưa (Dùng khi Add Student)
    // Lưu ý: Thứ tự tham số phải khớp với tên hàm (Student trước, Course sau)
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);

    // 2. Lấy danh sách các lớp mà học viên đang học (Dùng khi hiển thị Lịch/Profile
    // học sinh)
    List<Enrollment> findByStudentId(Long studentId);

    // 3. Tìm chính xác Enrollment dựa vào Student ID và Course ID
    // (Dùng để gỡ học sinh khỏi lớp hoặc lấy ID để điểm danh)
    Optional<Enrollment> findByStudentIdAndCourseId(Long studentId, Long courseId);

    // 4. Lấy danh sách học viên của 1 khóa (Dùng cho giáo viên xem danh sách lớp)
    List<Enrollment> findByCourseId(Long courseId);

    // 5. Query nâng cao: Tìm tất cả User (Student) có đăng ký vào các khóa học
    // thuộc Center ID này
    // Logic: Enrollment -> Course -> Center -> ID
    // Dùng DISTINCT để nếu 1 học sinh học 2 môn thì chỉ trả về 1 User duy nhất
    @Query("SELECT DISTINCT e.student FROM Enrollment e WHERE e.course.center.id = :centerId")
    List<User> findStudentsByCenterId(@Param("centerId") Long centerId);
}