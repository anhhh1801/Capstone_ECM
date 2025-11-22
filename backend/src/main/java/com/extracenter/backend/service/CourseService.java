package com.extracenter.backend.service;

import com.extracenter.backend.dto.CourseRequest;
import com.extracenter.backend.entity.Center;
import com.extracenter.backend.entity.ClassSlot;
import com.extracenter.backend.entity.Course;
import com.extracenter.backend.entity.User;
import com.extracenter.backend.repository.CenterRepository;
import com.extracenter.backend.repository.ClassSlotRepository;
import com.extracenter.backend.repository.CourseRepository;
import com.extracenter.backend.repository.UserRepository;

import java.util.List;

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

    @Transactional // Quan trọng: Nếu lưu Slot bị lỗi, nó sẽ hủy luôn việc lưu Course (Rollback)
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

        System.out.println("✅ Đã lưu Course thành công: " + savedCourse.getId());

        // 3. Tạo và lưu các ClassSlot (Lịch học)
        if (request.getSlots() == null) {
            System.out.println("⚠️ CẢNH BÁO: Danh sách slots bị NULL! Kiểm tra lại JSON gửi lên.");
        } else if (request.getSlots().isEmpty()) {
            System.out.println("⚠️ CẢNH BÁO: Danh sách slots bị RỖNG (Empty)!");
        } else {
            System.out.println("ℹ️ Tìm thấy " + request.getSlots().size() + " slots để lưu.");

            for (CourseRequest.SlotRequest slotReq : request.getSlots()) {
                ClassSlot slot = new ClassSlot();
                slot.setDayOfWeek(slotReq.getDayOfWeek());
                slot.setStartTime(slotReq.getStartTime());
                slot.setEndTime(slotReq.getEndTime());
                slot.setIsRecurring(true);
                slot.setCourse(savedCourse);

                classSlotRepository.save(slot);
                System.out.println("   -> Đã lưu Slot thứ: " + slotReq.getDayOfWeek());
            }
        }

        return savedCourse;
    }

    public List<Course> getCoursesByTeacher(Long teacherId) {
        return courseRepository.findByTeacherId(teacherId);
    }

    public List<Course> getCoursesByCenter(Long centerId) {
        return courseRepository.findByCenterId(centerId);
    }

    // Lấy chi tiết 1 khóa (Dùng cho trang Edit)
    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khóa học không tồn tại"));
    }

    // 1. Cập nhật khóa học
    public Course updateCourse(Long courseId, CourseRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Khóa học không tồn tại"));

        course.setName(request.getName());
        course.setSubject(request.getSubject());
        course.setGrade(request.getGrade());
        course.setDescription(request.getDescription());
        course.setStartDate(request.getStartDate());
        course.setEndDate(request.getEndDate());
        // Lưu ý: Thường ít khi cho đổi Center hay Teacher khi update, trừ khi có logic
        // đặc biệt

        return courseRepository.save(course);
    }

    // 2. Xóa khóa học
    public void deleteCourse(Long courseId) {
        // Kiểm tra xem có học viên hay điểm danh chưa thì chặn lại (tùy logic)
        // Tạm thời xóa thẳng tay
        try {
            courseRepository.deleteById(courseId);
        } catch (Exception e) {
            throw new RuntimeException("Không thể xóa khóa học này vì đã có dữ liệu liên quan (Lịch học, Học viên...)");
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

        // QUAN TRỌNG: Chỉ gán vào ghế DỰ BỊ (pendingTeacher)
        // Không được đụng vào ghế chính thức (teacher)
        course.setPendingTeacher(invitedUser);
        course.setInvitationStatus("PENDING");

        courseRepository.save(course);
    }

    public void respondToInvitation(Long courseId, String status) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Khóa học không tồn tại"));

        if ("ACCEPTED".equals(status)) {
            // CHẤP NHẬN:
            // 1. Chuyển người từ ghế dự bị -> ghế chính thức
            course.setTeacher(course.getPendingTeacher());

            // 2. Xóa ghế dự bị
            course.setPendingTeacher(null);
            course.setInvitationStatus("ACCEPTED");

        } else if ("REJECTED".equals(status)) {
            // TỪ CHỐI:
            // Chỉ cần xóa ghế dự bị là xong. Người dạy cũ (nếu có) vẫn giữ nguyên.
            course.setPendingTeacher(null);
            course.setInvitationStatus("REJECTED"); // Hoặc set về ACCEPTED để kết thúc trạng thái pending
        }

        courseRepository.save(course);
    }

    public List<Course> getPendingInvitations(Long teacherId) {
        // Gọi hàm mới bên Repository
        return courseRepository.findPendingInvitations(teacherId);
    }

}