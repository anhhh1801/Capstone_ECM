package com.extracenter.backend.controller;

import com.extracenter.backend.dto.ChangePasswordRequest;
import com.extracenter.backend.dto.CreateStudentRequest;
import com.extracenter.backend.dto.LoginRequest;
import com.extracenter.backend.dto.LoginResponse;
import com.extracenter.backend.dto.RegisterRequest;
import com.extracenter.backend.dto.UpdateProfileRequest;
import com.extracenter.backend.dto.UserStatsResponse;
import com.extracenter.backend.dto.VerifyOtpRequest;
import com.extracenter.backend.entity.User;
import com.extracenter.backend.repository.UserRepository;
import com.extracenter.backend.service.UserService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    // 1. API: Đăng ký Giáo viên (Bước 1 - Gửi mail)
    // POST: http://localhost:8080/api/users/register-teacher
    @PostMapping("/register-teacher")
    public ResponseEntity<?> registerTeacher(@RequestBody RegisterRequest request) {
        try {
            String result = userService.registerTeacher(request);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        // Now we pass BOTH email and otp to the service
        String result = userService.verifyAccount(request.getEmail(), request.getOtp());

        if (result.startsWith("Xác thực thành công")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    // API: Đăng nhập
    // POST: http://192.168.0.100:8080/api/users/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = userService.loginUser(request);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            if (e.getMessage().equals("Sai email hoặc mật khẩu!")) {
                return ResponseEntity.status(401).body(e.getMessage());
            }

            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    // API: Update Profile
    // PUT: /api/users/{id}/profile
    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody UpdateProfileRequest request) {
        try {
            User updatedUser = userService.updateProfile(id, request);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API: Change Password
    // PUT: /api/users/{id}/change-password
    @PutMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody ChangePasswordRequest request) {
        try {
            userService.changePassword(id, request);
            return ResponseEntity.ok("Đổi mật khẩu thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API: Deactivate Account (Self)
    // POST: /api/users/{id}/deactivate
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateAccount(@PathVariable Long id) {
        try {
            userService.deactivateAccount(id);
            return ResponseEntity.ok("Tài khoản đã được vô hiệu hóa.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API Tìm kiếm học sinh
    // GET: /api/users/search?keyword=Nguyen Van
    @GetMapping("/search")
    public ResponseEntity<List<User>> searchStudents(@RequestParam String keyword) {
        return ResponseEntity.ok(userRepository.searchStudents(keyword));
    }

    // API Tạo nhanh học sinh (Auto Email)
    // POST: /api/users/create-student
    @PostMapping("/create-student")
    public ResponseEntity<?> createStudentAuto(@RequestBody CreateStudentRequest request) {
        User newUser = userService.createStudentAutoEmail(request);
        return ResponseEntity.ok(newUser);
    }

    // API: Xóa vĩnh viễn User
    // DELETE: /api/users/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteStudentPermanently(id);
            return ResponseEntity.ok("Đã xóa tài khoản vĩnh viễn.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Không thể xóa: " + e.getMessage());
        }
    }

    // PUT: /api/users/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable Long id, @RequestBody CreateStudentRequest request) {
        try {
            User updated = userService.updateStudent(id, request);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API: Resend OTP
    // POST: /api/users/resend-otp?email=abc@gmail.com
    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestParam String email) {
        try {
            String result = userService.resendOtp(email);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API: Admin khóa/mở khóa User
    // PUT: /api/users/admin/lock?adminId=1&targetUserId=5
    @PutMapping("/admin/lock")
    public ResponseEntity<?> toggleLock(@RequestParam Long adminId, @RequestParam Long targetUserId) {
        try {
            String result = userService.toggleUserLock(adminId, targetUserId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    // API: Admin xem thống kê của User
    // GET: /api/users/admin/stats?adminId=1&targetUserId=5
    @GetMapping("/admin/stats")
    public ResponseEntity<?> getUserStats(@RequestParam Long adminId, @RequestParam Long targetUserId) {
        try {
            UserStatsResponse stats = userService.getUserStats(adminId, targetUserId);
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    // API: Get All Users (For Admin Dashboard)
    // GET: /api/users/admin/all
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllUsers() {
        // In a real app, use Pagination (Pageable) here!
        return ResponseEntity.ok(userRepository.findAll());
    }

}