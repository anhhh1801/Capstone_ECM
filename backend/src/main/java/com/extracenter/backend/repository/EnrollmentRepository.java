package com.extracenter.backend.repository;

import com.extracenter.backend.entity.Enrollment;
import com.extracenter.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    // 1. Check if a student is already registered for this course (Used when Adding
    // a Student).
    // Note: Parameter order matches the method name exactly (Student first, Course
    // second).
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);

    // 2. Get the list of classes a student is currently taking (Used for Student
    // Profile/Schedule).
    List<Enrollment> findByStudentId(Long studentId);

    // 3. Find the exact Enrollment record based on Student ID and Course ID.
    // (Used to remove a student from a class, or to fetch the Enrollment ID for
    // grading/attendance).
    Optional<Enrollment> findByStudentIdAndCourseId(Long studentId, Long courseId);

    // 4. Get the list of students in a specific course (Used by teachers to view
    // their class roster).
    List<Enrollment> findByCourseId(Long courseId);

    // 5. Advanced Query: Find all unique Users (Students) registered in courses
    // belonging to a specific Center.
    // Logic: Traverses Enrollment -> Course -> Center -> ID.
    // The DISTINCT keyword ensures that if a student takes 2 subjects at the same
    // center, they only appear once.
    @Query("SELECT DISTINCT e.student FROM Enrollment e WHERE e.course.center.id = :centerId")
    List<User> findStudentsByCenterId(@Param("centerId") Long centerId);
}