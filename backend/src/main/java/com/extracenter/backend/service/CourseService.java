package com.extracenter.backend.service;

import com.extracenter.backend.dto.CourseRequest;
import com.extracenter.backend.entity.*;
import com.extracenter.backend.repository.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private ClassSlotRepository classSlotRepository;
    @Autowired
    private CenterRepository centerRepository;
    @Autowired
    private UserRepository userRepository;

    // THÊM REPOSITORY NÀY ĐỂ QUẢN LÝ VIỆC ĐĂNG KÝ HỌC
    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Transactional
    public Course createCourse(CourseRequest request) {
        // 1. Tìm Center và Teacher
        Center center = centerRepository.findById(request.getCenterId())
                .orElseThrow(() -> new RuntimeException("Center không tồn tại"));
        User teacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher không tồn tại"));

        // 2. Tạo và lưu Course
        Course course = new Course();
        course.setName(request.getName());
        course.setSubject(request.getSubject());
        course.setGrade(request.getGrade());
        course.setDescription(request.getDescription());
        course.setStartDate(request.getStartDate());
        course.setEndDate(request.getEndDate());
        course.setStatus("ACTIVE");
        course.setCenter(center);
        course.setTeacher(teacher);

        Course savedCourse = courseRepository.save(course);

        // 3. Tạo và lưu các ClassSlot (Lịch học)
        if (request.getSlots() != null && !request.getSlots().isEmpty()) {
            for (CourseRequest.SlotRequest slotReq : request.getSlots()) {
                ClassSlot slot = new ClassSlot();
                slot.setDayOfWeek(slotReq.getDayOfWeek());
                slot.setStartTime(slotReq.getStartTime());
                slot.setEndTime(slotReq.getEndTime());
                slot.setIsRecurring(true);
                slot.setCourse(savedCourse);
                classSlotRepository.save(slot);
            }
        }
        return savedCourse;
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public List<Course> getCoursesByTeacher(Long teacherId) {
        return courseRepository.findByTeacherId(teacherId);
    }

    public List<Course> getCoursesByCenter(Long centerId) {
        return courseRepository.findByCenterId(centerId);
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khóa học không tồn tại"));
    }

    public Course updateCourse(Long courseId, CourseRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Khóa học không tồn tại"));

        course.setName(request.getName());
        course.setSubject(request.getSubject());
        course.setGrade(request.getGrade());
        course.setDescription(request.getDescription());
        course.setStartDate(request.getStartDate());
        course.setEndDate(request.getEndDate());

        return courseRepository.save(course);
    }

    public void deleteCourse(Long courseId) {
        try {
            // Khi cấu hình CascadeType.ALL ở Entity, xóa Course sẽ tự động xóa Enrollment
            courseRepository.deleteById(courseId);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xóa khóa học: " + e.getMessage());
        }
    }

    public void inviteTeacherToCourse(Long courseId, String teacherEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Khóa học không tồn tại"));

        User invitedUser = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giáo viên!"));

        if (!"TEACHER".equalsIgnoreCase(invitedUser.getRole().getName())) {
            throw new RuntimeException("Người này không phải là Giáo viên!");
        }

        course.setPendingTeacher(invitedUser);
        course.setInvitationStatus("PENDING");
        courseRepository.save(course);
    }

    public void respondToInvitation(Long courseId, String status) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Khóa học không tồn tại"));

        if ("ACCEPTED".equals(status)) {
            course.setTeacher(course.getPendingTeacher());
            course.setPendingTeacher(null);
            course.setInvitationStatus("ACCEPTED");
        } else if ("REJECTED".equals(status)) {
            course.setPendingTeacher(null);
            course.setInvitationStatus("REJECTED");
        }
        courseRepository.save(course);
    }

    public List<Course> getPendingInvitations(Long teacherId) {
        return courseRepository.findPendingInvitations(teacherId);
    }

    // =================================================================
    // PHẦN SỬA ĐỔI QUAN TRỌNG: DÙNG ENROLLMENT THAY VÌ GETSTUDENTS()
    // =================================================================

    @Transactional
    public void addStudentToCourse(Long courseId, Long studentId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // 1. Kiểm tra xem đã tồn tại Enrollment chưa
        boolean exists = enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId);
        if (exists) {
            throw new RuntimeException("Học sinh này đã có trong lớp rồi!");
        }

        // 2. Tạo Enrollment mới
        Enrollment enrollment = new Enrollment();
        enrollment.setCourse(course);
        enrollment.setStudent(student);
        // Có thể set thêm enrollmentDate, scholarship nếu có...

        enrollmentRepository.save(enrollment);

        // 3. Logic phụ: Thêm học sinh vào danh sách quản lý của Center (nếu chưa có)
        // (Giữ nguyên logic cũ của bạn vì nó hợp lý)
        if (course.getCenter() != null) {
            // Kiểm tra xem đã kết nối với center chưa, chưa thì thêm
            boolean isAlreadyInCenter = student.getConnectedCenters().stream()
                    .anyMatch(c -> c.getId().equals(course.getCenter().getId()));

            if (!isAlreadyInCenter) {
                student.getConnectedCenters().add(course.getCenter());
                userRepository.save(student);
            }
        }
    }

    @Transactional
    public void removeStudentFromCourse(Long courseId, Long studentId) {
        // 1. Tìm bản ghi Enrollment cụ thể
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new RuntimeException("Học sinh này không có trong lớp!"));

        // 2. Xóa bản ghi đó -> Tự động mất liên kết
        enrollmentRepository.delete(enrollment);
    }

    // Lấy danh sách học sinh thông qua Enrollment
    public Set<User> getCourseStudents(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Map từ List<Enrollment> -> Set<User>
        return course.getEnrollments().stream()
                .map(Enrollment::getStudent)
                .collect(Collectors.toSet());
    }
}