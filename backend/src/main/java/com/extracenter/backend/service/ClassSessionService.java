package com.extracenter.backend.service;

import com.extracenter.backend.entity.ClassSession;
import com.extracenter.backend.repository.ClassSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class ClassSessionService {

    @Autowired
    private ClassSessionRepository classSessionRepository;

    // 1. Get schedule for a STUDENT within a specific week/month
    public List<ClassSession> getStudentSchedule(Long studentId, LocalDate startDate, LocalDate endDate) {
        return classSessionRepository.findByStudentIdAndDateRange(studentId, startDate, endDate);
    }

    // 2. Get schedule for a TEACHER within a specific week/month
    public List<ClassSession> getTeacherSchedule(Long teacherId, LocalDate startDate, LocalDate endDate) {
        return classSessionRepository.findByTeacherIdAndDateRange(teacherId, startDate, endDate);
    }

    // 3. Get all sessions for a specific course (Syllabus view)
    public List<ClassSession> getSessionsByCourse(Long courseId) {
        return classSessionRepository.findByCourseIdOrderByDateAsc(courseId);
    }

    // 4. Update a specific session (e.g., Reschedule due to rain/sickness)
    @Transactional
    public ClassSession rescheduleSession(Long sessionId, LocalDate newDate, LocalTime newStartTime,
            LocalTime newEndTime) {
        ClassSession session = classSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Class session not found!"));

        session.setDate(newDate);
        session.setStartTime(newStartTime);
        session.setEndTime(newEndTime);

        // You could also add a 'status' field to ClassSession like "RESCHEDULED" or
        // "CANCELLED"

        return classSessionRepository.save(session);
    }

    // 5. Cancel/Delete a specific session
    @Transactional
    public void cancelSession(Long sessionId) {
        classSessionRepository.deleteById(sessionId);
    }

    public List<ClassSession> getUpcomingByStudent(Long studentId) {
        // Lấy thời gian hiện tại để so sánh
        return classSessionRepository.findUpcomingSessionsByStudentId(studentId, LocalDateTime.now());
    }
}