package com.extracenter.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.extracenter.backend.entity.Course;
import com.extracenter.backend.entity.User;

public interface CourseRepository extends JpaRepository<Course, Long> {

    // Count total number of courses a specific teacher is teaching
    long countByTeacherId(Long teacherId);

    // Find all courses belonging to a specific Center
    List<Course> findByCenterId(Long centerId);

    boolean existsBySubjectId(Long subjectId);

    boolean existsByGradeId(Long gradeId);

    // Find all courses taught by a specific teacher
    List<Course> findByTeacherId(Long teacherId);

    @Query("SELECT c FROM Course c JOIN c.enrollments e WHERE e.student.id = :studentId")
    List<Course> findByStudentId(@Param("studentId") Long studentId);

    // Find all courses in a center taught by a specific teacher.
    List<Course> findByCenterIdAndTeacherId(Long centerId, Long teacherId);

    // Find all distinct Teachers who are actively teaching at a specific Center.
    // This is a great query because it avoids needing a separate "Center-Teacher"
    // table!
    @Query("SELECT DISTINCT c.teacher FROM Course c WHERE c.center.id = :centerId")
    List<User> findTeachersByCenterId(@Param("centerId") Long centerId);

    // Find courses based on the teacher and their invitation status (e.g.,
    // 'ACCEPTED')
    List<Course> findByTeacherIdAndInvitationStatus(Long teacherId, String status);

    // Find pending teaching invitations for a specific teacher
    @Query("SELECT c FROM Course c WHERE c.pendingTeacher.id = :teacherId AND c.invitationStatus = 'PENDING'")
    List<Course> findPendingInvitations(@Param("teacherId") Long teacherId);

    // Count total unique students taught by a specific teacher.
    // Since Course no longer has a direct "students" list, we MUST JOIN from Course
    // -> Enrollments -> Student.
    // The DISTINCT keyword ensures that if a student takes 2 classes with the same
    // teacher, they are only counted once.
    @Query("SELECT COUNT(DISTINCT e.student) FROM Course c JOIN c.enrollments e WHERE c.teacher.id = :teacherId")
    long countStudentsByTeacherId(@Param("teacherId") Long teacherId);
}