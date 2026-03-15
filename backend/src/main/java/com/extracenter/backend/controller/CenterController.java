package com.extracenter.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
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
import com.extracenter.backend.dto.ClassSlotRequest;
import com.extracenter.backend.dto.ClassroomRequest;
import com.extracenter.backend.dto.GradeRequest;
import com.extracenter.backend.dto.SubjectRequest;
import com.extracenter.backend.entity.Center;
import com.extracenter.backend.entity.ClassSlot;
import com.extracenter.backend.entity.Classroom;
import com.extracenter.backend.entity.Grade;
import com.extracenter.backend.entity.Subject;
import com.extracenter.backend.entity.User;
import com.extracenter.backend.repository.CourseRepository;
import com.extracenter.backend.repository.UserRepository;
import com.extracenter.backend.service.CenterService;
import com.extracenter.backend.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/centers")
@CrossOrigin(originPatterns = "*") // Allow frontend to communicate with this API
public class CenterController {

    @Autowired
    private CenterService centerService;
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private UserService userService;
    @Autowired
    private UserRepository userRepository;

    // API: Create a new center
    // POST: http://localhost:8080/api/centers
    @PostMapping
    public ResponseEntity<?> createCenter(@Valid @RequestBody CenterRequest request) {
        try {
            Center newCenter = centerService.createCenter(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(newCenter);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // API: Get center details by ID
    // GET: http://localhost:8080/api/centers/1
    @GetMapping("/{id}")
    public ResponseEntity<Center> getCenterById(@PathVariable Long id) {
        return ResponseEntity.ok(centerService.getCenterById(id));
    }

    // API: Get a list of all centers
    // GET: http://localhost:8080/api/centers
    @GetMapping
    public ResponseEntity<List<Center>> getAllCenters() {
        return ResponseEntity.ok(centerService.getAllCenters());
    }

    // API: Get centers managed by a specific user (Manager)
    // GET: http://localhost:8080/api/centers/teacher/1
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Center>> getCentersByManager(@PathVariable Long teacherId) {
        return ResponseEntity.ok(centerService.getCentersByManager(teacherId));
    }

    // API: Get centers where a specific teacher is actively teaching
    // GET: http://localhost:8080/api/centers/teaching/1
    @GetMapping("/teaching/{teacherId}")
    public ResponseEntity<List<Center>> getCentersTeaching(@PathVariable Long teacherId) {
        return ResponseEntity.ok(centerService.getCentersTeaching(teacherId));
    }

    // API: Update an existing center
    // PUT: http://localhost:8080/api/centers/1
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCenter(@PathVariable Long id, @Valid @RequestBody CenterRequest request) {
        try {
            Center updatedCenter = centerService.updateCenter(id, request);
            return ResponseEntity.ok(updatedCenter);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // API: Delete a center
    // DELETE: http://localhost:8080/api/centers/1
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCenter(@PathVariable Long id) {
        try {
            centerService.deleteCenter(id);
            // BEST PRACTICE: Return JSON so React handles it cleanly
            return ResponseEntity.ok(Map.of("message", "Center deleted successfully!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // API: Get a list of all teachers teaching at a specific center
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
            Grade grade = centerService.createGrade(centerId,
                    request.getName(),
                    request.getFromAge(),
                    request.getToAge(),
                    request.getDescription());
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
            Grade grade = centerService.updateGrade(centerId,
                    gradeId,
                    request.getName(),
                    request.getFromAge(),
                    request.getToAge(),
                    request.getDescription());
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
    // API: Get a list of all students studying at a specific center
    // GET: http://localhost:8080/api/centers/1/students
    @GetMapping("/{centerId}/students")
    public ResponseEntity<List<User>> getStudentsByCenter(@PathVariable Long centerId) {
        return ResponseEntity.ok(userRepository.findStudentsByCenterId(centerId));
    }

    // API: Assign an existing student to a center
    // POST: http://localhost:8080/api/centers/1/assign-student?studentId=123
    @PostMapping("/{centerId}/assign-student")
    public ResponseEntity<?> assignStudentToCenter(
            @PathVariable Long centerId,
            @RequestParam Long studentId) {
        try {
            userService.connectStudentToCenter(studentId, centerId);
            return ResponseEntity.ok(Map.of("message", "Student successfully assigned to the center!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // API: Remove/Unlink a student from a center (Does not delete the user account)
    // DELETE: http://localhost:8080/api/centers/1/students/123
    @DeleteMapping("/{centerId}/students/{studentId}")
    public ResponseEntity<?> removeStudentFromCenter(
            @PathVariable Long centerId,
            @PathVariable Long studentId) {
        try {
            userService.removeStudentFromCenter(studentId, centerId);
            return ResponseEntity.ok(Map.of("message", "Student successfully removed from the center."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // API: Get list of classrooms by center
    // GET: http://localhost:8080/api/centers/1/classrooms
    @GetMapping("/{centerId}/classrooms")
    public ResponseEntity<List<Classroom>> getClassroomsByCenter(@PathVariable Long centerId) {
        return ResponseEntity.ok(centerService.getClassroomsByCenter(centerId));
    }

    // API: Create classroom (owner only)
    // POST: http://localhost:8080/api/centers/1/classrooms
    @PostMapping("/{centerId}/classrooms")
    public ResponseEntity<?> createClassroom(
            @PathVariable Long centerId,
            @Valid @RequestBody ClassroomRequest request) {
        try {
            Classroom classroom = centerService.createClassroom(centerId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(classroom);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // API: Update classroom (owner only)
    // PUT: http://localhost:8080/api/centers/1/classrooms/2
    @PutMapping("/{centerId}/classrooms/{classroomId}")
    public ResponseEntity<?> updateClassroom(
            @PathVariable Long centerId,
            @PathVariable Long classroomId,
            @Valid @RequestBody ClassroomRequest request) {
        try {
            Classroom classroom = centerService.updateClassroom(centerId, classroomId, request);
            return ResponseEntity.ok(classroom);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // API: Delete classroom (owner only)
    // DELETE: http://localhost:8080/api/centers/1/classrooms/2?managerId=10
    @DeleteMapping("/{centerId}/classrooms/{classroomId}")
    public ResponseEntity<?> deleteClassroom(
            @PathVariable Long centerId,
            @PathVariable Long classroomId,
            @RequestParam Long managerId) {
        try {
            centerService.deleteClassroom(centerId, classroomId, managerId);
            return ResponseEntity.ok(Map.of("message", "Classroom deleted successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // API: Get list of class slots by center
    // GET: http://localhost:8080/api/centers/1/class-slots
    @GetMapping("/{centerId}/class-slots")
    public ResponseEntity<List<ClassSlot>> getClassSlotsByCenter(@PathVariable Long centerId) {
        return ResponseEntity.ok(centerService.getClassSlotsByCenter(centerId));
    }

    // API: Create class slot (owner only)
    // POST: http://localhost:8080/api/centers/1/class-slots
    @PostMapping("/{centerId}/class-slots")
    public ResponseEntity<?> createClassSlot(
            @PathVariable Long centerId,
            @Valid @RequestBody ClassSlotRequest request) {
        try {
            ClassSlot slot = centerService.createClassSlot(centerId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(slot);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // API: Update class slot (owner only)
    // PUT: http://localhost:8080/api/centers/1/class-slots/2
    @PutMapping("/{centerId}/class-slots/{slotId}")
    public ResponseEntity<?> updateClassSlot(
            @PathVariable Long centerId,
            @PathVariable Long slotId,
            @Valid @RequestBody ClassSlotRequest request) {
        try {
            ClassSlot slot = centerService.updateClassSlot(centerId, slotId, request);
            return ResponseEntity.ok(slot);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // API: Delete class slot (owner only)
    // DELETE: http://localhost:8080/api/centers/1/class-slots/2?managerId=10
    @DeleteMapping("/{centerId}/class-slots/{slotId}")
    public ResponseEntity<?> deleteClassSlot(
            @PathVariable Long centerId,
            @PathVariable Long slotId,
            @RequestParam Long managerId) {
        try {
            centerService.deleteClassSlot(centerId, slotId, managerId);
            return ResponseEntity.ok(Map.of("message", "Class slot deleted successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}