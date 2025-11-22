package com.extracenter.backend.repository;

import com.extracenter.backend.entity.Center;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CenterRepository extends JpaRepository<Center, Long> {
    // Tìm trung tâm do user này quản lý
    List<Center> findByManagerId(Long managerId);

    // 2. Trung tâm tôi ĐƯỢC THÊM VÀO GIẢNG DẠY (Mới)
    // Logic: Lấy các Center từ bảng Course mà teacher là tôi,
    // NHƯNG loại bỏ các Center mà tôi làm quản lý (để tránh trùng lặp với danh sách
    // trên)
    @Query("SELECT DISTINCT c.center FROM Course c WHERE c.teacher.id = :teacherId AND c.center.manager.id != :teacherId")
    List<Center> findCentersTeachingByTeacherId(@Param("teacherId") Long teacherId);
}