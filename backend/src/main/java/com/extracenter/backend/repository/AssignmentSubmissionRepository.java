package com.extracenter.backend.repository;

import com.extracenter.backend.entity.AssignmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {

    // Lấy danh sách học sinh đã nộp bài cho 1 Assignment cụ thể (Dành cho giáo
    // viên)
    List<AssignmentSubmission> findByAssignmentId(Long assignmentId);

    // Tìm bài nộp của 1 học sinh cụ thể trong 1 Assignment (Dùng để kiểm tra xem đã
    // nộp chưa)
    Optional<AssignmentSubmission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);
}