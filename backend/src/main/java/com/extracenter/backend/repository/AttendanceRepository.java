package com.extracenter.backend.repository;

import com.extracenter.backend.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.time.LocalDate;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    // Tìm danh sách điểm danh của 1 buổi cụ thể (để xem lại hoặc sửa)
    List<Attendance> findByClassSlotIdAndDate(Long classSlotId, LocalDate date);

    // Kiểm tra xem buổi này đã điểm danh chưa?
    boolean existsByClassSlotIdAndDate(Long classSlotId, LocalDate date);
}