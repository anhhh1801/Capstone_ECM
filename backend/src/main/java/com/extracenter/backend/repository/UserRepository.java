package com.extracenter.backend.repository;

import com.extracenter.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Find a user by their exact login email (Used for Authentication/Login)
    Optional<User> findByEmail(String email);

    // Check if a login email already exists (Used during Registration validation)
    Boolean existsByEmail(String email);

    // Check if a backup/personal email already exists
    Boolean existsByPersonalEmail(String personalEmail);

    // Search for students by Name, Phone Number, OR Email (Fuzzy/Partial search)
    // Uses LOWER() and CONCAT() for case-insensitive, full-name matching
    @Query("SELECT u FROM User u WHERE u.role.name = 'STUDENT' AND " +
            "(LOWER(CONCAT(u.lastName, ' ', u.firstName)) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR u.phoneNumber LIKE CONCAT('%', :keyword, '%') " +
            "OR u.email LIKE CONCAT('%', :keyword, '%'))")
    List<User> searchStudents(@Param("keyword") String keyword);

    // Find users (specifically students) whose connectedCenters list contains this
    // centerId
    @Query("SELECT u FROM User u JOIN u.connectedCenters c WHERE c.id = :centerId AND u.role.name = 'STUDENT'")
    List<User> findStudentsByCenterId(@Param("centerId") Long centerId);

    // Find users who have not verified their accounts within a certain time frame
    // (Used by a scheduled Cron Job to delete dead/spam accounts)
    @Query("SELECT u FROM User u WHERE u.isEnabled = false AND u.createdDate < :cutoffTime")
    List<User> findUnverifiedUsersBefore(@Param("cutoffTime") LocalDateTime cutoffTime);

    // Count how many centers a specific user is connected to/manages
    @Query("SELECT COUNT(c) FROM User u JOIN u.connectedCenters c WHERE u.id = :userId")
    long countCentersByUserId(@Param("userId") Long userId);

    // NEWLY ADDED: Count total users by their role (e.g., "STUDENT", "TEACHER",
    // "MANAGER")
    // Highly useful for the Admin Dashboard statistics!
    @Query("SELECT COUNT(u) FROM User u WHERE u.role.name = :roleName")
    long countByRoleName(@Param("roleName") String roleName);
}