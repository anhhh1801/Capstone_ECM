package com.extracenter.backend.repository;

import com.extracenter.backend.entity.ClassSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassSlotRepository extends JpaRepository<ClassSlot, Long> {

    // Find slots where the course is assigned to this teacher
    @Query("SELECT s FROM ClassSlot s WHERE s.course.teacher.id = :teacherId")
    List<ClassSlot> findByTeacherId(@Param("teacherId") Long teacherId);

    // Find slots where a student is enrolled in the course
    @Query("SELECT s FROM ClassSlot s JOIN Enrollment e ON e.course.id = s.course.id WHERE e.user.id = :studentId")
    List<ClassSlot> findByStudentId(@Param("studentId") Long studentId);
}