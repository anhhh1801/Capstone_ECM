package com.extracenter.backend.controller;

import com.extracenter.backend.dto.CreateStudentRequest;
import com.extracenter.backend.dto.LoginRequest;
import com.extracenter.backend.dto.RegisterRequest;
import com.extracenter.backend.entity.User;
import com.extracenter.backend.repository.UserRepository;
import com.extracenter.backend.service.UserService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000") // Cho phép Next.js gọi
public class UserController {

    @Autowired
    private UserService userService;
    private UserRepository userRepository;

    // API: Đăng ký
    // POST: http://localhost:8080/api/users/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User createdUser = userService.registerUser(request);
            return ResponseEntity.ok("Đăng ký thành công: " + createdUser.getEmail());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

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

    // 2. API: Xác thực tài khoản (Bước 2 - Bấm link mail)
    // GET: http://localhost:8080/api/users/verify?token=abc...
    @GetMapping("/verify")
    public ResponseEntity<?> verifyAccount(@RequestParam String token) {
        String result = userService.verifyAccount(token);
        if (result.startsWith("Xác thực thành công")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    // API: Đăng nhập
    // POST: http://localhost:8080/api/users/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userService.loginUser(request);
        if (user != null) {
            return ResponseEntity.ok(user); // Trả về thông tin user (Frontend sẽ lưu lại)
        } else {
            return ResponseEntity.status(401).body("Sai email hoặc mật khẩu!");
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
}