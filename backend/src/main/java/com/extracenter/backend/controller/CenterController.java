package com.extracenter.backend.controller;

import com.extracenter.backend.dto.CenterRequest;
import com.extracenter.backend.entity.Center;
import com.extracenter.backend.entity.User;
import com.extracenter.backend.repository.CourseRepository;
import com.extracenter.backend.repository.UserRepository;
import com.extracenter.backend.service.CenterService;
import com.extracenter.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/centers")
@CrossOrigin(origins = "*") // Allow frontend to communicate with this API
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
}