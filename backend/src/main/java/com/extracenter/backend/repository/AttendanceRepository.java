package com.extracenter.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import com.extracenter.backend.entity.Attendance;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    // Fetch the attendance list for a specific lesson (to view or edit)
    List<Attendance> findByClassSessionId(Long classSessionId);

    // Check if attendance has already been taken for this specific lesson
    boolean existsByClassSessionId(Long classSessionId);

    // ADDED BONUS: Find a specific student's attendance for a specific day
    // This is very useful when a student marks themselves present or a teacher
    // edits a single row.
    Optional<Attendance> findByEnrollmentIdAndClassSessionId(Long enrollmentId, Long classSessionId);

    @Modifying
    @Transactional
    void deleteByClassSlotId(Long classSlotId);

    @Modifying
    @Transactional
    void deleteByClassSessionId(Long classSessionId);
}