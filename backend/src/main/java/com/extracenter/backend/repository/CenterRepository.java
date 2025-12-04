package com.extracenter.backend.repository;

import com.extracenter.backend.entity.Center;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface CenterRepository extends JpaRepository<Center, Long> {
    // Tìm trung tâm do user này quản lý
    List<Center> findByManagerId(Long managerId);

    @Query("SELECT DISTINCT c.center FROM Course c WHERE c.teacher.id = :teacherId AND c.center.manager.id != :teacherId")
    List<Center> findCentersTeachingByTeacherId(@Param("teacherId") Long teacherId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM student_centers WHERE center_id = :centerId", nativeQuery = true)
    void removeAllStudentLinks(@Param("centerId") Long centerId);
}