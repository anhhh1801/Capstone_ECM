package com.extracenter.backend.repository;

import com.extracenter.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Tự động tạo câu lệnh SQL: SELECT * FROM User WHERE email = ?
    Optional<User> findByEmail(String email);

    // Kiểm tra email đã tồn tại chưa
    Boolean existsByEmail(String email);

    Boolean existsByPersonalEmail(String personalEmail);

    // Tìm theo Tên HOẶC Số điện thoại (Tìm gần đúng - Containing)
    // Dùng LOWER() để không phân biệt hoa thường
    @Query("SELECT u FROM User u WHERE u.role.name = 'STUDENT' AND " +
            "(LOWER(CONCAT(u.lastName, ' ', u.firstName)) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR u.phoneNumber LIKE CONCAT('%', :keyword, '%') " +
            "OR u.email LIKE CONCAT('%', :keyword, '%'))")
    List<User> searchStudents(@Param("keyword") String keyword);

    // Tìm những User mà danh sách connectedCenters có chứa centerId này
    @Query("SELECT u FROM User u JOIN u.connectedCenters c WHERE c.id = :centerId AND u.role.name = 'STUDENT'")
    List<User> findStudentsByCenterId(@Param("centerId") Long centerId);

    @Query("SELECT u FROM User u WHERE u.isEnabled = false AND u.createdDate < :cutoffTime")
    List<User> findUnverifiedUsersBefore(@Param("cutoffTime") LocalDateTime cutoffTime);

    @Query("SELECT COUNT(c) FROM User u JOIN u.connectedCenters c WHERE u.id = :userId")
    long countCentersByUserId(@Param("userId") Long userId);
}