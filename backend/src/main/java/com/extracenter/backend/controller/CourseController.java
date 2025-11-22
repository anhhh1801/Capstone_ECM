package com.extracenter.backend.controller;

import com.extracenter.backend.dto.CourseRequest;
import com.extracenter.backend.dto.CreateStudentRequest;
import com.extracenter.backend.entity.Course;
import com.extracenter.backend.entity.User;
import com.extracenter.backend.repository.UserRepository;
import com.extracenter.backend.service.CourseService;
import com.extracenter.backend.service.UserService;

import java.util.List;

import org.apache.catalina.Manager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "http://localhost:3000")
public class CourseController {

    @Autowired
    private CourseService courseService;

    // API: Tạo khóa học + Lịch
    // POST: http://localhost:8080/api/courses
    @PostMapping
    public ResponseEntity<?> createCourse(@RequestBody CourseRequest request) {
        try {
            Course newCourse = courseService.createCourse(request);
            return ResponseEntity.ok("Tạo khóa học thành công ID: " + newCourse.getId());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Lấy chi tiết 1 khóa (Để fill vào form Edit)
    @GetMapping("/{id}")
    public ResponseEntity<Course> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    // API: Cập nhật khóa học
    // PUT: http://localhost:8080/api/courses/1
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @RequestBody CourseRequest request) {
        try {
            Course updated = courseService.updateCourse(id, request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API: Xóa khóa học
    // DELETE: http://localhost:8080/api/courses/1
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.ok("Đã xóa khóa học thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API: Lấy danh sách khóa học của giáo viên
    // GET: http://localhost:8080/api/courses/teacher/1
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Course>> getCoursesByTeacher(@PathVariable Long teacherId) {
        return ResponseEntity.ok(courseService.getCoursesByTeacher(teacherId));
    }

    // API: Lấy danh sách khóa học (Có hỗ trợ lọc theo centerId)
    // GET: http://localhost:8080/api/courses?centerId=1
    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses(@RequestParam(required = false) Long centerId) {
        if (centerId != null) {
            return ResponseEntity.ok(courseService.getCoursesByCenter(centerId));
        }
        // Nếu không truyền centerId thì trả về rỗng hoặc tất cả (tùy logic)
        return null;
    }

    // API:Mời giáo viên (Manager dùng)
    // POST: /api/courses/1/invite?email=abc@gmail.com
    @PostMapping("/{id}/invite")
    public ResponseEntity<?> inviteTeacher(@PathVariable Long id, @RequestParam String email) {
        try {
            courseService.inviteTeacherToCourse(id, email);
            return ResponseEntity.ok("Đã gửi lời mời thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API: Phản hồi lời mời (Teacher dùng)
    // POST: /api/courses/1/respond?status=ACCEPTED
    @PostMapping("/{id}/respond")
    public ResponseEntity<?> respondInvitation(@PathVariable Long id, @RequestParam String status) {
        courseService.respondToInvitation(id, status);
        return ResponseEntity.ok("Đã cập nhật trạng thái!");
    }

    // API: Lấy danh sách lời mời (Teacher dùng)
    // GET: /api/courses/invitations/1
    @GetMapping("/invitations/{teacherId}")
    public ResponseEntity<List<Course>> getInvitations(@PathVariable Long teacherId) {
        return ResponseEntity.ok(courseService.getPendingInvitations(teacherId));
    }
}