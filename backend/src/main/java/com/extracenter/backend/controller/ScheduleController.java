package com.extracenter.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.extracenter.backend.dto.ScheduleResponse;
import com.extracenter.backend.entity.ClassSession;
import com.extracenter.backend.entity.ClassSlot;
import com.extracenter.backend.repository.ClassSessionRepository;
import com.extracenter.backend.repository.ClassSlotRepository;

@RestController
@RequestMapping("/api/schedule")
@CrossOrigin(originPatterns = "*")
public class ScheduleController {

    @Autowired
    private ClassSlotRepository classSlotRepository;

    @Autowired
    private ClassSessionRepository classSessionRepository;

    // ==========================================
    // 1. GENERAL WEEKLY RULES (ClassSlot)
    // ==========================================

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<ScheduleResponse>> getTeacherScheduleRules(@PathVariable Long teacherId) {
        List<ClassSlot> slots = classSlotRepository.findByTeacherId(teacherId);
        return ResponseEntity.ok(mapToResponse(slots));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ScheduleResponse>> getStudentScheduleRules(@PathVariable Long studentId) {
        List<ClassSlot> slots = classSlotRepository.findByStudentId(studentId);
        return ResponseEntity.ok(mapToResponse(slots));
    }

    // ==========================================
    // 2. ACTUAL CALENDAR DATES (ClassSession)
    // ==========================================

    @GetMapping("/teacher/{teacherId}/sessions")
    public ResponseEntity<List<ScheduleResponse>> getTeacherSessions(
            @PathVariable Long teacherId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<ClassSession> sessions = classSessionRepository.findByTeacherIdAndDateRange(teacherId, startDate, endDate);
        return ResponseEntity.ok(mapToSessionResponse(sessions));
    }

    @GetMapping("/student/{studentId}/sessions")
    public ResponseEntity<List<ScheduleResponse>> getStudentSessions(
            @PathVariable Long studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<ClassSession> sessions = classSessionRepository.findByStudentIdAndDateRange(studentId, startDate, endDate);
        return ResponseEntity.ok(mapToSessionResponse(sessions));
    }

    // ==========================================
    // HELPER MAPPERS (Fixed using @Builder!)
    // ==========================================

    // Mapper for ClassSlot (Weekly Rules)
    private List<ScheduleResponse> mapToResponse(List<ClassSlot> slots) {
        return slots.stream().flatMap(slot -> {

            // Safe variable extraction
            String teacherName = "Chưa phân công";
            String subjectName = "N/A";
            Long courseId = null;
            String courseName = "Unknown Course";
            String roomName = slot.getClassroom() != null ? slot.getClassroom().getLocation() : "N/A";

            if (slot.getCourse() != null) {
                courseId = slot.getCourse().getId();
                courseName = slot.getCourse().getName();
                subjectName = slot.getCourse().getSubject() != null ? slot.getCourse().getSubject().getName() : "N/A";

                if (slot.getCourse().getTeacher() != null) {
                    teacherName = slot.getCourse().getTeacher().getFirstName() + " " +
                            slot.getCourse().getTeacher().getLastName();
                }
            }

            if (slot.getDaysOfWeek() == null || slot.getDaysOfWeek().isEmpty()) {
                if (slot.getDayOfWeek() == null) {
                    return Stream.empty();
                }

                return Stream.of(
                        ScheduleResponse.builder()
                                .courseId(courseId)
                                .courseName(courseName)
                                .subject(subjectName)
                                .dayOfWeek(slot.getDayOfWeek().getValue())
                                .startTime(slot.getStartTime())
                                .endTime(slot.getEndTime())
                                .roomName(roomName)
                                .teacherName(teacherName)
                                .status(Boolean.TRUE.equals(slot.getIsRecurring()) ? "Recurring Rule" : "One-time Rule")
                                .build());
            }

            final Long finalCourseId = courseId;
            final String finalCourseName = courseName;
            final String finalSubjectName = subjectName;
            final String finalRoomName = roomName;
            final String finalTeacherName = teacherName;
            final String finalStatus = Boolean.TRUE.equals(slot.getIsRecurring()) ? "Recurring Rule" : "One-time Rule";

            return slot.getDaysOfWeek().stream()
                    .map(day -> ScheduleResponse.builder()
                            .courseId(finalCourseId)
                            .courseName(finalCourseName)
                            .subject(finalSubjectName)
                            .dayOfWeek(day.getValue())
                            .startTime(slot.getStartTime())
                            .endTime(slot.getEndTime())
                            .roomName(finalRoomName)
                            .teacherName(finalTeacherName)
                            .status(finalStatus)
                            .build());

        }).collect(Collectors.toList());
    }

    // Mapper for ClassSession (Actual Dates)
    private List<ScheduleResponse> mapToSessionResponse(List<ClassSession> sessions) {
        return sessions.stream().map(session -> {

            String teacherName = "Chưa phân công";
            String subjectName = "N/A";
            Long courseId = null;
            String courseName = "Unknown Course";

            if (session.getCourse() != null) {
                courseId = session.getCourse().getId();
                courseName = session.getCourse().getName();
                subjectName = session.getCourse().getSubject().getName();

                if (session.getCourse().getTeacher() != null) {
                    teacherName = session.getCourse().getTeacher().getFirstName() + " " +
                            session.getCourse().getTeacher().getLastName();
                }
            }

            // FIX: Explicitly assign to a typed variable to resolve Java compiler inference
            // errors!
            ScheduleResponse response = ScheduleResponse.builder()
                    .sessionId(session.getId()) // Populated!
                    .courseId(courseId)
                    .courseName(courseName)
                    .subject(subjectName)
                    .date(session.getDate()) // Populated!
                    .dayOfWeek(session.getDate().getDayOfWeek().getValue()) // Extracts 1-7 from the date
                    .startTime(session.getStartTime())
                    .endTime(session.getEndTime())
                    .roomName("Room A01")
                    .teacherName(teacherName)
                    .status(session.getStatus())
                    .build();

            return response;

        }).collect(Collectors.toList());
    }
}