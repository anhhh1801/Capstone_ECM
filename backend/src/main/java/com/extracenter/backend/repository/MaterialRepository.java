package com.extracenter.backend.repository;

import com.extracenter.backend.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {

    // 1. Fetch all general materials uploaded to a Course (e.g., the main Syllabus)
    // We check where classSession is NULL because those are course-level files.
    List<Material> findByCourseIdAndClassSessionIsNull(Long courseId);

    // 2. Fetch materials attached to a specific day/lesson (e.g., "Day 1 Slides")
    List<Material> findByClassSessionId(Long classSessionId);
}