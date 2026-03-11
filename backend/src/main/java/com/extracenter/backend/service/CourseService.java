package com.extracenter.backend.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.time.DayOfWeek;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.extracenter.backend.dto.CourseRequest;
import com.extracenter.backend.entity.Center;
import com.extracenter.backend.entity.ClassSession;
import com.extracenter.backend.entity.ClassSlot;
import com.extracenter.backend.entity.Course;
import com.extracenter.backend.entity.Enrollment;
import com.extracenter.backend.entity.Grade;
import com.extracenter.backend.entity.Subject;
import com.extracenter.backend.entity.User;
import com.extracenter.backend.repository.CenterRepository;
import com.extracenter.backend.repository.ClassSessionRepository;
import com.extracenter.backend.repository.ClassSlotRepository;
import com.extracenter.backend.repository.CourseRepository;
import com.extracenter.backend.repository.EnrollmentRepository;
import com.extracenter.backend.repository.GradeRepository;
import com.extracenter.backend.repository.SubjectRepository;
import com.extracenter.backend.repository.UserRepository;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private ClassSlotRepository classSlotRepository;
    @Autowired
    private ClassSessionRepository classSessionRepository; // ADDED THIS
    @Autowired
    private CenterRepository centerRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private SubjectRepository subjectRepository;
    @Autowired
    private GradeRepository gradeRepository;

    // THÊM REPOSITORY NÀY ĐỂ QUẢN LÝ VIỆC ĐĂNG KÝ HỌC
    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Transactional
    public Course createCourse(CourseRequest request) {
        // 1. Find Center and Teacher
        Center center = centerRepository.findById(request.getCenterId())
                .orElseThrow(() -> new RuntimeException("Center not found!"));
        User teacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found!"));

        // 2. Create and save the Course
        Course course = new Course();
        course.setName(request.getName());

        if (request.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new RuntimeException("Môn học không tồn tại"));
            course.setSubject(subject);
        } else {
            course.setSubject(null);
        }

        if (request.getGradeId() != null) {
            Grade grade = gradeRepository.findById(request.getGradeId())
                    .orElseThrow(() -> new RuntimeException("Khối lớp không tồn tại"));
            course.setGrade(grade);
        } else {
            course.setGrade(null);
        }

        course.setDescription(request.getDescription());
        course.setStartDate(request.getStartDate());
        course.setEndDate(request.getEndDate());
        course.setStatus("ACTIVE");
        course.setCenter(center);
        course.setTeacher(teacher);

        Course savedCourse = courseRepository.save(course);

        // 3. Create and save the ClassSlots (The generic schedule rules)
        List<ClassSlot> savedSlots = new ArrayList<>();
        if (request.getSlots() != null && !request.getSlots().isEmpty()) {
            for (CourseRequest.SlotRequest slotReq : request.getSlots()) {
                ClassSlot slot = new ClassSlot();
                slot.setDayOfWeek(slotReq.getDayOfWeek());
                slot.setStartTime(slotReq.getStartTime());
                slot.setEndTime(slotReq.getEndTime());
                slot.setIsRecurring(true);
                slot.setCourse(savedCourse);
                savedSlots.add(classSlotRepository.save(slot));
            }
        }

        // 4. THE MAGIC: Automatically generate the physical calendar days
        // (ClassSessions)
        if (!savedSlots.isEmpty() && course.getStartDate() != null && course.getEndDate() != null) {
            generateClassSessions(savedCourse, savedSlots);
        }

        return savedCourse;
    }

    // Helper method to generate ClassSessions based on the start/end date and slot
    // rules
    private void generateClassSessions(Course course, List<ClassSlot> slots) {
        List<ClassSession> sessionsToSave = new ArrayList<>();
        LocalDate currentDate = course.getStartDate();
        LocalDate endDate = course.getEndDate();

        while (!currentDate.isAfter(endDate)) {
            // Java DayOfWeek: 1=Monday, 7=Sunday. Matches your convention!
            DayOfWeek currentDayOfWeek = currentDate.getDayOfWeek();

            for (ClassSlot slot : slots) {
                if (slot.getDayOfWeek() == currentDayOfWeek) {
                    ClassSession session = new ClassSession();
                    session.setCourse(course);
                    session.setDate(currentDate);
                    session.setStartTime(slot.getStartTime());
                    session.setEndTime(slot.getEndTime());
                    sessionsToSave.add(session);
                }
            }
            currentDate = currentDate.plusDays(1); // Move to next day
        }

        // Batch save for high performance
        classSessionRepository.saveAll(sessionsToSave);
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
                .orElseThrow(() -> new RuntimeException("Course not found!"));
    }

    @Transactional
    public Course updateCourse(Long courseId, CourseRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found!"));

        course.setName(request.getName());

        if (request.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new RuntimeException("Môn học không tồn tại"));
            course.setSubject(subject);
        } else {
            course.setSubject(null);
        }

        if (request.getGradeId() != null) {
            Grade grade = gradeRepository.findById(request.getGradeId())
                    .orElseThrow(() -> new RuntimeException("Khối lớp không tồn tại"));
            course.setGrade(grade);
        } else {
            course.setGrade(null);
        }

        course.setDescription(request.getDescription());
        course.setStartDate(request.getStartDate());
        course.setEndDate(request.getEndDate());

        return courseRepository.save(course);
    }

    @Transactional
    public void deleteCourse(Long courseId) {
        try {
            // CascadeType.ALL on the Entity will auto-delete Enrollments, Slots, and
            // Sessions!
            courseRepository.deleteById(courseId);
        } catch (Exception e) {
            throw new RuntimeException("Error deleting course: " + e.getMessage());
        }
    }

    @Transactional
    public void inviteTeacherToCourse(Long courseId, String teacherEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found!"));

        User invitedUser = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found!"));

        if (!"TEACHER".equalsIgnoreCase(invitedUser.getRole().getName())) {
            throw new RuntimeException("This user is not registered as a Teacher!");
        }

        course.setPendingTeacher(invitedUser);
        course.setInvitationStatus("PENDING");
        courseRepository.save(course);
    }

    @Transactional
    public void respondToInvitation(Long courseId, String status) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found!"));

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
    // ENROLLMENT MANAGEMENT
    // =================================================================

    @Transactional
    public void addStudentToCourse(Long courseId, Long studentId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found!"));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found!"));

        // 1. Check if enrollment already exists
        boolean exists = enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId);
        if (exists) {
            throw new RuntimeException("Student is already enrolled in this class!");
        }

        // 2. Create new Enrollment
        Enrollment enrollment = new Enrollment();
        enrollment.setCourse(course);
        enrollment.setStudent(student);
        enrollmentRepository.save(enrollment);

        // 3. Link student to Center (if not already linked)
        if (course.getCenter() != null) {
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
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new RuntimeException("Student is not enrolled in this class!"));

        enrollmentRepository.delete(enrollment);
    }

    // Retrieve list of students via Enrollment repository for better performance
    public Set<User> getCourseStudents(Long courseId) {
        // OPTIMIZATION: Instead of loading the Course and relying on Lazy Loading,
        // we query the EnrollmentRepository directly!
        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);

        return enrollments.stream()
                .map(Enrollment::getStudent)
                .collect(Collectors.toSet());
    }
}