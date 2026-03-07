package com.extracenter.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.extracenter.backend.dto.CenterRequest;
import com.extracenter.backend.dto.GradeRequest;
import com.extracenter.backend.dto.SubjectRequest;
import com.extracenter.backend.entity.Center;
import com.extracenter.backend.entity.Grade;
import com.extracenter.backend.entity.Subject;
import com.extracenter.backend.entity.User;
import com.extracenter.backend.repository.CourseRepository;
import com.extracenter.backend.repository.UserRepository;
import com.extracenter.backend.service.CenterService;
import com.extracenter.backend.service.UserService;

@RestController
@RequestMapping("/api/centers")
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

    // API: Lấy danh sách môn học của trung tâm
    // GET: http://localhost:8080/api/centers/1/subjects
    @GetMapping("/{centerId}/subjects")
    public ResponseEntity<List<Subject>> getSubjectsByCenter(@PathVariable Long centerId) {
        return ResponseEntity.ok(centerService.getSubjectsByCenter(centerId));
    }

    // API: Tạo môn học cho trung tâm
    // POST: http://localhost:8080/api/centers/1/subjects
    @PostMapping("/{centerId}/subjects")
    public ResponseEntity<?> createSubject(@PathVariable Long centerId, @RequestBody SubjectRequest request) {
        try {
            Subject subject = centerService.createSubject(centerId, request.getName(), request.getDescription());
            return ResponseEntity.ok(subject);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API: Cập nhật môn học
    // PUT: http://localhost:8080/api/centers/1/subjects/2
    @PutMapping("/{centerId}/subjects/{subjectId}")
    public ResponseEntity<?> updateSubject(@PathVariable Long centerId, @PathVariable Long subjectId, @RequestBody SubjectRequest request) {
        try {
            Subject subject = centerService.updateSubject(centerId, subjectId, request.getName(), request.getDescription());
            return ResponseEntity.ok(subject);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API: Xóa môn học
    // DELETE: http://localhost:8080/api/centers/1/subjects/2
    @DeleteMapping("/{centerId}/subjects/{subjectId}")
    public ResponseEntity<?> deleteSubject(@PathVariable Long centerId, @PathVariable Long subjectId) {
        try {
            centerService.deleteSubject(centerId, subjectId);
            return ResponseEntity.ok("Đã xóa môn học.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API: Lấy danh sách khối lớp của trung tâm
    // GET: http://localhost:8080/api/centers/1/grades
    @GetMapping("/{centerId}/grades")
    public ResponseEntity<List<Grade>> getGradesByCenter(@PathVariable Long centerId) {
        return ResponseEntity.ok(centerService.getGradesByCenter(centerId));
    }

    // API: Tạo khối lớp cho trung tâm
    // POST: http://localhost:8080/api/centers/1/grades
    @PostMapping("/{centerId}/grades")
    public ResponseEntity<?> createGrade(@PathVariable Long centerId, @RequestBody GradeRequest request) {
        try {
            Grade grade = centerService.createGrade(centerId, request.getName(), request.getValue(), request.getDescription());
            return ResponseEntity.ok(grade);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API: Cập nhật khối lớp
    // PUT: http://localhost:8080/api/centers/1/grades/2
    @PutMapping("/{centerId}/grades/{gradeId}")
    public ResponseEntity<?> updateGrade(@PathVariable Long centerId, @PathVariable Long gradeId, @RequestBody GradeRequest request) {
        try {
            Grade grade = centerService.updateGrade(centerId, gradeId, request.getName(), request.getValue(), request.getDescription());
            return ResponseEntity.ok(grade);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API: Xóa khối lớp
    // DELETE: http://localhost:8080/api/centers/1/grades/2
    @DeleteMapping("/{centerId}/grades/{gradeId}")
    public ResponseEntity<?> deleteGrade(@PathVariable Long centerId, @PathVariable Long gradeId) {
        try {
            centerService.deleteGrade(centerId, gradeId);
            return ResponseEntity.ok("Đã xóa khối lớp.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
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