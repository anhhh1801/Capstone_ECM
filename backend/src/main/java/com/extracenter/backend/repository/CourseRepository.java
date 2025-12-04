package com.extracenter.backend.repository;

import com.extracenter.backend.entity.Course;
import com.extracenter.backend.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

    long countByTeacherId(Long teacherId);

    // Tìm tất cả khóa học của 1 Center
    List<Course> findByCenterId(Long centerId);

    // Tìm tất cả khóa học do giáo viên này dạy
    List<Course> findByTeacherId(Long teacherId);

    // Tìm tất cả Giáo viên đang dạy tại 1 Center cụ thể
    @Query("SELECT DISTINCT c.teacher FROM Course c WHERE c.center.id = :centerId")
    List<User> findTeachersByCenterId(@Param("centerId") Long centerId);

    List<Course> findByTeacherIdAndInvitationStatus(Long teacherId, String status);

    // Tìm các lời mời dạy (Pending)
    @Query("SELECT c FROM Course c WHERE c.pendingTeacher.id = :teacherId AND c.invitationStatus = 'PENDING'")
    List<Course> findPendingInvitations(@Param("teacherId") Long teacherId);

    // Vì Course không còn list "students" nữa, mà dùng list "enrollments".
    // Ta phải JOIN từ Course -> Enrollments -> Student
    @Query("SELECT COUNT(DISTINCT e.student) FROM Course c JOIN c.enrollments e WHERE c.teacher.id = :teacherId")
    long countStudentsByTeacherId(@Param("teacherId") Long teacherId);

}