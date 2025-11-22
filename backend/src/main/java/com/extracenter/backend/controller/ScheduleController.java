package com.extracenter.backend.controller;

import com.extracenter.backend.dto.ScheduleResponse;
import com.extracenter.backend.entity.ClassSlot;
import com.extracenter.backend.repository.ClassSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/schedule")
@CrossOrigin(origins = "http://localhost:3000")
public class ScheduleController {

    @Autowired
    private ClassSlotRepository classSlotRepository;

    // API: Lấy lịch của Giáo Viên
    // GET: http://localhost:8080/api/schedule/teacher/1
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<ScheduleResponse>> getTeacherSchedule(@PathVariable Long teacherId) {
        List<ClassSlot> slots = classSlotRepository.findByTeacherId(teacherId);
        return ResponseEntity.ok(mapToResponse(slots));
    }

    // API: Lấy lịch của Học Viên
    // GET: http://localhost:8080/api/schedule/student/5
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ScheduleResponse>> getStudentSchedule(@PathVariable Long studentId) {
        List<ClassSlot> slots = classSlotRepository.findByStudentId(studentId);
        return ResponseEntity.ok(mapToResponse(slots));
    }

    // Hàm phụ: Chuyển đổi từ Entity sang DTO gọn gàng
    private List<ScheduleResponse> mapToResponse(List<ClassSlot> slots) {
        List<ScheduleResponse> responseList = new ArrayList<>();
        for (ClassSlot slot : slots) {
            responseList.add(new ScheduleResponse(
                    slot.getCourse().getId(),
                    slot.getCourse().getName(),
                    slot.getDayOfWeek(),
                    slot.getStartTime(),
                    slot.getEndTime(),
                    "Room A01", // Hardcode tạm, sau này lấy từ slot.getClassroom()
                    slot.getCourse().getTeacher().getFirstName() + " " + slot.getCourse().getTeacher().getLastName()));
        }
        return responseList;
    }
}