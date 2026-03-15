package com.extracenter.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.extracenter.backend.entity.ClassSlot;

public interface ClassSlotRepository extends JpaRepository<ClassSlot, Long> {

    List<ClassSlot> findByCenterId(Long centerId);

    Optional<ClassSlot> findByIdAndCenterId(Long slotId, Long centerId);

    // FIX: Changed 'e.user.id' to 'e.student.id' to match the Enrollment entity
    @Query("SELECT DISTINCT s FROM ClassSlot s JOIN Enrollment e ON e.course.id = s.course.id WHERE e.student.id = :studentId")
    List<ClassSlot> findByStudentId(@Param("studentId") Long studentId);

    // This one was likely working fine, but including it here so your file is
    // complete!
    @Query("SELECT DISTINCT s FROM ClassSlot s WHERE s.course.teacher.id = :teacherId")
    List<ClassSlot> findByTeacherId(@Param("teacherId") Long teacherId);

    @Modifying
    @Transactional
    void deleteByCourseId(Long courseId);
}