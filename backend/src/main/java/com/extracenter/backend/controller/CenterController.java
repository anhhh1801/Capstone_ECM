package com.extracenter.backend.controller;

import com.extracenter.backend.dto.CenterRequest;
import com.extracenter.backend.entity.Center;
import com.extracenter.backend.entity.User;
import com.extracenter.backend.repository.CourseRepository;
import com.extracenter.backend.repository.EnrollmentRepository;
import com.extracenter.backend.repository.UserRepository;
import com.extracenter.backend.service.CenterService;
import com.extracenter.backend.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/centers")
@CrossOrigin(origins = "http://localhost:3000")
public class CenterController {

    @Autowired
    private CenterService centerService;
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;

    // API: Tạo trung tâm mới
    // POST: http://localhost:8080/api/centers
    @PostMapping
    public ResponseEntity<?> createCenter(@RequestBody CenterRequest request) {
        try {
            Center newCenter = centerService.createCenter(request);
            return ResponseEntity.ok(newCenter);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API: Lấy chi tiết 1 trung tâm
    // GET: http://localhost:8080/api/centers/1
    @GetMapping("/{id}")
    public ResponseEntity<Center> getCenterById(@PathVariable Long id) {
        return ResponseEntity.ok(centerService.getCenterById(id));
    }

    // API: Lấy danh sách trung tâm
    // GET: http://localhost:8080/api/centers
    @GetMapping
    public ResponseEntity<List<Center>> getAllCenters() {
        return ResponseEntity.ok(centerService.getAllCenters());
    }

    // API mới: Lấy trung tâm của giáo viên
    // GET: http://localhost:8080/api/centers/teacher/1
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Center>> getCentersByManager(@PathVariable Long teacherId) {
        return ResponseEntity.ok(centerService.getCentersByManager(teacherId));
    }

    // API MỚI: Lấy trung tâm tôi đi dạy
    // GET: http://localhost:8080/api/centers/teaching/1
    @GetMapping("/teaching/{teacherId}")
    public ResponseEntity<List<Center>> getCentersTeaching(@PathVariable Long teacherId) {
        return ResponseEntity.ok(centerService.getCentersTeaching(teacherId));
    }

    // API MỚI: Cập nhật trung tâm
    // PUT: http://localhost:8080/api/centers/1
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCenter(@PathVariable Long id, @RequestBody CenterRequest request) {
        try {
            Center updatedCenter = centerService.updateCenter(id, request);
            return ResponseEntity.ok(updatedCenter);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API MỚI: Xóa trung tâm
    // DELETE: http://localhost:8080/api/centers/1
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCenter(@PathVariable Long id) {
        try {
            centerService.deleteCenter(id);
            return ResponseEntity.ok("Đã xóa trung tâm thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API: Lấy danh sách giáo viên của trung tâm
    // GET: http://localhost:8080/api/centers/1/teachers
    @GetMapping("/{centerId}/teachers")
    public ResponseEntity<List<User>> getTeachersByCenter(@PathVariable Long centerId) {
        return ResponseEntity.ok(courseRepository.findTeachersByCenterId(centerId));
    }

    // GET: /api/centers/1/students
    @GetMapping("/{centerId}/students")
    public ResponseEntity<List<User>> getStudentsByCenter(@PathVariable Long centerId) {
        // ĐỔI TỪ enrollmentRepository SANG userRepository
        return ResponseEntity.ok(userRepository.findStudentsByCenterId(centerId));
    }

    // API: Gán học sinh có sẵn vào trung tâm
    // POST: /api/centers/{centerId}/assign-student?studentId=123
    @PostMapping("/{centerId}/assign-student")
    public ResponseEntity<?> assignStudentToCenter(
            @PathVariable Long centerId,
            @RequestParam Long studentId) {
        try {
            userService.connectStudentToCenter(studentId, centerId);
            return ResponseEntity.ok("Đã thêm học sinh vào trung tâm thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API: Gỡ học sinh khỏi trung tâm (Không xóa user)
    // DELETE: /api/centers/{centerId}/students/{studentId}
    @DeleteMapping("/{centerId}/students/{studentId}")
    public ResponseEntity<?> removeStudentFromCenter(
            @PathVariable Long centerId,
            @PathVariable Long studentId) {
        try {
            userService.removeStudentFromCenter(studentId, centerId);
            return ResponseEntity.ok("Đã gỡ học sinh khỏi trung tâm.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}