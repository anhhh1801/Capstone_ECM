package com.extracenter.backend.controller;

import com.extracenter.backend.dto.CourseRequest;
import com.extracenter.backend.entity.Course;
import com.extracenter.backend.entity.User;
import com.extracenter.backend.service.CourseService;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(originPatterns = "*") // Allow frontend to communicate with this API
public class CourseController {

    @Autowired
    private CourseService courseService;

    // API: Create a new Course + Auto-generate Schedule (ClassSessions)
    // POST: http://localhost:8080/api/courses
    @PostMapping
    public ResponseEntity<?> createCourse(@Valid @RequestBody CourseRequest request) {
        try {
            Course newCourse = courseService.createCourse(request);
            // Return the created course object so the frontend can immediately use its ID
            return ResponseEntity.status(HttpStatus.CREATED).body(newCourse);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // API: Get course details by ID (Used to fill the Edit form or View details)
    // GET: http://localhost:8080/api/courses/1
    @GetMapping("/{id}")
    public ResponseEntity<Course> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    // API: Update an existing course
    // PUT: http://localhost:8080/api/courses/1
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @Valid @RequestBody CourseRequest request) {
        try {
            Course updated = courseService.updateCourse(id, request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // API: Delete a course
    // DELETE: http://localhost:8080/api/courses/1
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.ok(Map.of("message", "Course deleted successfully!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // API: Get a list of all courses taught by a specific teacher
    // GET: http://localhost:8080/api/courses/teacher/1
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Course>> getCoursesByTeacher(@PathVariable Long teacherId) {
        return ResponseEntity.ok(courseService.getCoursesByTeacher(teacherId));
    }

    // API: Get a list of courses (Supports filtering by centerId)
    // GET: http://localhost:8080/api/courses?centerId=1
    @GetMapping
    public ResponseEntity<List<Course>> getAllCoursesByCenter(@RequestParam(required = false) Long centerId) {
        if (centerId != null) {
            return ResponseEntity.ok(courseService.getCoursesByCenter(centerId));
        }
        // Best Practice: If no centerId is provided, return all courses instead of null
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    // API: Invite a teacher to a course (Used by Center Managers)
    // POST: http://localhost:8080/api/courses/1/invite?email=abc@gmail.com
    @PostMapping("/{id}/invite")
    public ResponseEntity<?> inviteTeacher(@PathVariable Long id, @RequestParam String email) {
        try {
            courseService.inviteTeacherToCourse(id, email);
            return ResponseEntity.ok(Map.of("message", "Invitation sent successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // API: Respond to a teaching invitation (Used by Teachers)
    // POST: http://localhost:8080/api/courses/1/respond?status=ACCEPTED
    @PostMapping("/{id}/respond")
    public ResponseEntity<?> respondInvitation(@PathVariable Long id, @RequestParam String status) {
        try {
            courseService.respondToInvitation(id, status);
            return ResponseEntity.ok(Map.of("message", "Invitation status updated successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // API: Get a list of pending invitations for a specific teacher
    // GET: http://localhost:8080/api/courses/invitations/1
    @GetMapping("/invitations/{teacherId}")
    public ResponseEntity<List<Course>> getInvitations(@PathVariable Long teacherId) {
        return ResponseEntity.ok(courseService.getPendingInvitations(teacherId));
    }

    // API: Get a list of all students enrolled in a specific course
    // GET: http://localhost:8080/api/courses/1/students
    @GetMapping("/{courseId}/students")
    public ResponseEntity<Set<User>> getStudents(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseService.getCourseStudents(courseId));
    }

    // API: Add/Enroll a student into a course
    // POST: http://localhost:8080/api/courses/1/students/5
    @PostMapping("/{courseId}/students/{studentId}")
    public ResponseEntity<?> addStudent(@PathVariable Long courseId, @PathVariable Long studentId) {
        try {
            courseService.addStudentToCourse(courseId, studentId);
            return ResponseEntity.ok(Map.of("message", "Student successfully added to the course."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // API: Remove a student from a course
    // DELETE: http://localhost:8080/api/courses/1/students/5
    @DeleteMapping("/{courseId}/students/{studentId}")
    public ResponseEntity<?> removeStudent(@PathVariable Long courseId, @PathVariable Long studentId) {
        try {
            courseService.removeStudentFromCourse(courseId, studentId);
            return ResponseEntity.ok(Map.of("message", "Student successfully removed from the course."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}