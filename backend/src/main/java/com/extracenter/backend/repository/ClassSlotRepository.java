package com.extracenter.backend.repository;

import com.extracenter.backend.entity.ClassSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ClassSlotRepository extends JpaRepository<ClassSlot, Long> {

    // FIX: Changed 'e.user.id' to 'e.student.id' to match the Enrollment entity
    @Query("SELECT s FROM ClassSlot s JOIN Enrollment e ON e.course.id = s.course.id WHERE e.student.id = :studentId")
    List<ClassSlot> findByStudentId(@Param("studentId") Long studentId);

    // This one was likely working fine, but including it here so your file is
    // complete!
    @Query("SELECT s FROM ClassSlot s WHERE s.course.teacher.id = :teacherId")
    List<ClassSlot> findByTeacherId(@Param("teacherId") Long teacherId);
}