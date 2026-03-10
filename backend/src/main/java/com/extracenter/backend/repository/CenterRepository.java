package com.extracenter.backend.repository;

import com.extracenter.backend.entity.Center;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface CenterRepository extends JpaRepository<Center, Long> {

    // Find all centers managed by a specific user
    List<Center> findByManagerId(Long managerId);

    // Find centers where a teacher is teaching courses,
    // EXCLUDING the centers that they already manage.
    @Query("SELECT DISTINCT c.center FROM Course c WHERE c.teacher.id = :teacherId AND c.center.manager.id != :teacherId")
    List<Center> findCentersTeachingByTeacherId(@Param("teacherId") Long teacherId);

    // Bulk delete all student connections to a specific center in the join table.
    // Useful when deleting a Center to prevent foreign key constraint violations.
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM student_centers WHERE center_id = :centerId", nativeQuery = true)
    void removeAllStudentLinks(@Param("centerId") Long centerId);
}