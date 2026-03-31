package com.extracenter.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.extracenter.backend.entity.AssignmentSubmission;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {

    // Lấy danh sách học sinh đã nộp bài cho 1 Assignment cụ thể (Dành cho giáo
    // viên)
    List<AssignmentSubmission> findByAssignmentId(Long assignmentId);

    // Tìm bài nộp của 1 học sinh cụ thể trong 1 Assignment (Dùng để kiểm tra xem đã
    // nộp chưa)
    Optional<AssignmentSubmission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);

    @Modifying
    @Transactional
    @Query("DELETE FROM AssignmentSubmission sub WHERE sub.assignment.id IN (SELECT a.id FROM Assignment a WHERE a.course.id = :courseId)")
    void deleteByCourseId(@Param("courseId") Long courseId);
}