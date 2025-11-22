package com.extracenter.backend.repository;

import com.extracenter.backend.entity.ClassSlot;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClassSlotRepository extends JpaRepository<ClassSlot, Long> {

    // 1. Tìm lịch dạy cho GIÁO VIÊN (Dựa vào teacherId trong bảng Course)
    @Query("SELECT s FROM ClassSlot s WHERE s.course.teacher.id = :teacherId")
    List<ClassSlot> findByTeacherId(@Param("teacherId") Long teacherId);

    // 2. Tìm lịch học cho HỌC VIÊN (Dựa vào bảng Enrollment)
    // Logic: Tìm Slot -> của Course -> mà Course đó nằm trong danh sách Enrollment
    // của Student
    @Query("SELECT s FROM ClassSlot s WHERE s.course.id IN " +
            "(SELECT e.course.id FROM Enrollment e WHERE e.student.id = :studentId)")
    List<ClassSlot> findByStudentId(@Param("studentId") Long studentId);
}