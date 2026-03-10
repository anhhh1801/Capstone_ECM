package com.extracenter.backend.repository;

import com.extracenter.backend.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    // Fetch the attendance list for a specific lesson (to view or edit)
    List<Attendance> findByClassSessionId(Long classSessionId);

    // Check if attendance has already been taken for this specific lesson
    boolean existsByClassSessionId(Long classSessionId);

    // ADDED BONUS: Find a specific student's attendance for a specific day
    // This is very useful when a student marks themselves present or a teacher
    // edits a single row.
    Optional<Attendance> findByEnrollmentIdAndClassSessionId(Long enrollmentId, Long classSessionId);
}