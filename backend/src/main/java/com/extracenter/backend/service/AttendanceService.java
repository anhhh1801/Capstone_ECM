package com.extracenter.backend.service;

import com.extracenter.backend.dto.AttendanceRequest;
import com.extracenter.backend.entity.Attendance;
import com.extracenter.backend.entity.ClassSlot;
import com.extracenter.backend.entity.Enrollment;
import com.extracenter.backend.repository.AttendanceRepository;
import com.extracenter.backend.repository.ClassSlotRepository;
import com.extracenter.backend.repository.EnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;
    @Autowired
    private ClassSlotRepository classSlotRepository;
    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Transactional // Quan trọng: Update hàng loạt, lỗi 1 cái là rollback hết
    public String markAttendance(AttendanceRequest request) {
        // 1. Lấy thông tin Slot
        ClassSlot slot = classSlotRepository.findById(request.getClassSlotId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch học!"));

        // 2. Lấy danh sách điểm danh cũ (nếu có) để cập nhật
        List<Attendance> existingRecords = attendanceRepository.findByClassSlotIdAndDate(request.getClassSlotId(),
                request.getDate());

        for (AttendanceRequest.StudentStatus status : request.getStudentStatuses()) {
            Attendance attendance = null;

            // Kiểm tra xem học viên này đã được điểm danh trong DB chưa?
            // (Logic tìm trong list existingRecords)
            for (Attendance record : existingRecords) {
                if (record.getEnrollment().getStudent().getId().equals(status.getStudentId())) {
                    attendance = record; // Tìm thấy bản ghi cũ -> Sẽ update
                    break;
                }
            }

            // Nếu chưa có -> Tạo mới
            if (attendance == null) {
                attendance = new Attendance();
                attendance.setClassSlot(slot);
                attendance.setDate(request.getDate());

                // Tìm Enrollment của học viên này trong khóa học đó
                // (Lưu ý: Cách tìm này hơi chậm nếu data lớn, nhưng với quy mô lớp học thì OK)
                Long courseId = slot.getCourse().getId();
                Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(status.getStudentId(), courseId)
                        .orElseThrow(() -> new RuntimeException(
                                "Học viên ID " + status.getStudentId() + " không thuộc lớp này!"));

                attendance.setEnrollment(enrollment);
            }

            // Cập nhật trạng thái
            attendance.setIsPresent(status.getIsPresent());
            attendance.setNote(status.getNote());

            attendanceRepository.save(attendance);
        }

        return "Đã lưu điểm danh thành công!";
    }

    // Hàm lấy dữ liệu điểm danh (để hiển thị lên Frontend)
    public List<Attendance> getAttendanceList(Long classSlotId, LocalDate date) {
        return attendanceRepository.findByClassSlotIdAndDate(classSlotId, date);
    }
}