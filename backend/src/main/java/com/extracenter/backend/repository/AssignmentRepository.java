package com.extracenter.backend.repository;

import com.extracenter.backend.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    // Lấy tất cả bài tập của một khóa học, sắp xếp theo hạn nộp tăng dần
    List<Assignment> findByCourseIdOrderByDueDateAsc(Long courseId);

    // Lấy bài tập của một buổi học cụ thể
    List<Assignment> findByClassSessionId(Long classSessionId);

    @Query("SELECT a FROM Assignment a JOIN a.course c JOIN c.enrollments e JOIN e.student s WHERE s.id = :studentId AND NOT EXISTS (SELECT 1 FROM AssignmentSubmission sub WHERE sub.assignment.id = a.id AND sub.student.id = :studentId) ORDER BY a.dueDate ASC")
    List<Assignment> findPendingAssignmentsByStudentId(@Param("studentId") Long studentId);
}