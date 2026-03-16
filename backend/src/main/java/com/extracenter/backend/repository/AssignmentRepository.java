package com.extracenter.backend.repository;

import com.extracenter.backend.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    // Lấy tất cả bài tập của một khóa học, sắp xếp theo hạn nộp tăng dần
    List<Assignment> findByCourseIdOrderByDueDateAsc(Long courseId);

    // Lấy bài tập của một buổi học cụ thể
    List<Assignment> findByClassSessionId(Long classSessionId);
}