package com.extracenter.backend.service;

import com.extracenter.backend.dto.CreateStudentRequest;
import com.extracenter.backend.dto.LoginRequest;
import com.extracenter.backend.dto.RegisterRequest;
import com.extracenter.backend.entity.Center;
import com.extracenter.backend.entity.Role;
import com.extracenter.backend.entity.User;
import com.extracenter.backend.entity.VerificationToken;
import com.extracenter.backend.repository.CenterRepository;
import com.extracenter.backend.repository.RoleRepository;
import com.extracenter.backend.repository.UserRepository;
import com.extracenter.backend.repository.VerificationTokenRepository;
import com.extracenter.backend.service.EmailUtils; // Đừng quên import cái này

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private VerificationTokenRepository tokenRepository;
    @Autowired
    private EmailService emailService;
    @Autowired
    private CenterRepository centerRepository;

    // --- CÁC HÀM PUBLIC (API GỌI) ---

    // 1. Xử lý Đăng ký (Admin/Teacher tạo tay hoặc logic cũ)
    public User registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại!");
        }
        String roleName = request.getRole().toUpperCase();
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Role không hợp lệ!"));

        User newUser = new User();
        newUser.setFirstName(request.getFirstName());
        newUser.setLastName(request.getLastName());
        newUser.setEmail(request.getEmail());
        newUser.setPassword(request.getPassword());
        newUser.setRole(role);

        return userRepository.save(newUser);
    }

    // 2. Xử lý Đăng nhập
    public User loginUser(LoginRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (user.isEnabled() && user.getPassword().equals(request.getPassword())) { // Thêm check isEnabled
                return user;
            }
        }
        return null;
    }

    // 3. Tạo học sinh nhanh (Auto Email)
    // Sửa lại hàm tạo học sinh
    public User createStudentAutoEmail(CreateStudentRequest request) {
        // 1. Logic sinh email (giữ nguyên)
        String finalEmail = generateUniqueEcmEmail(request.getFirstName(), request.getLastName());

        User newUser = new User();
        newUser.setFirstName(request.getFirstName());
        newUser.setLastName(request.getLastName());
        newUser.setEmail(finalEmail);
        newUser.setPhoneNumber(request.getPhoneNumber());
        newUser.setDateOfBirth(request.getDateOfBirth());
        newUser.setPassword("ecm123");
        newUser.setEnabled(true);

        Role studentRole = roleRepository.findByName("STUDENT").orElseThrow();
        newUser.setRole(studentRole);

        if (request.getCenterId() == null) {
            throw new RuntimeException("Lỗi: Chưa chọn trung tâm quản lý học sinh này!");
        }

        Center center = centerRepository.findById(request.getCenterId())
                .orElseThrow(() -> new RuntimeException("Trung tâm không tồn tại"));
        newUser.getConnectedCenters().add(center);

        return userRepository.save(newUser);
    }

    // (Bonus) Hàm thêm học sinh cũ vào trung tâm mới (dùng khi add vào lớp)
    public void connectStudentToCenter(Long studentId, Long centerId) {
        User student = userRepository.findById(studentId).orElseThrow();
        Center center = centerRepository.findById(centerId).orElseThrow();

        student.getConnectedCenters().add(center);
        userRepository.save(student);
    }

    // 4. GIAI ĐOẠN 1: Giáo viên đăng ký tạm (Gửi mail verify)
    public String registerTeacher(RegisterRequest request) {
        if (userRepository.existsByPersonalEmail(request.getEmail())) {
            throw new RuntimeException("Email cá nhân này đã được sử dụng!");
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPersonalEmail(request.getEmail());
        user.setEnabled(false);

        // Mẹo: Set email đăng nhập tạm thời là email cá nhân + uuid để tránh trùng
        // nếu có ai đó cố tình spam đăng ký. Hoặc để nguyên email cá nhân cũng được.
        user.setEmail(request.getEmail());

        user.setPassword(java.util.UUID.randomUUID().toString());

        Role teacherRole = roleRepository.findByName("TEACHER").orElseThrow();
        user.setRole(teacherRole);

        userRepository.save(user);

        VerificationToken token = new VerificationToken(user);
        tokenRepository.save(token);

        emailService.sendVerificationEmail(user.getPersonalEmail(), token.getToken());

        return "Đã gửi mail xác nhận. Vui lòng kiểm tra hòm thư!";
    }

    // 5. GIAI ĐOẠN 2: Xác thực & Tạo tài khoản thật
    public String verifyAccount(String token) {
        VerificationToken vt = tokenRepository.findByToken(token);
        if (vt == null || vt.getExpiryDate().isBefore(LocalDateTime.now())) {
            return "Link xác thực không hợp lệ hoặc đã hết hạn!";
        }

        User user = vt.getUser();
        if (user.isEnabled()) {
            return "Tài khoản này đã được kích hoạt rồi!";
        }

        // Tái sử dụng hàm sinh email chung
        String finalEmail = generateUniqueEcmEmail(user.getFirstName(), user.getLastName());

        // Cập nhật User
        user.setEmail(finalEmail);
        user.setPassword("ecm123"); // Nên dùng random password ở đây để bảo mật hơn
        user.setEnabled(true);

        userRepository.save(user);
        tokenRepository.delete(vt);

        emailService.sendCredentialEmail(user.getPersonalEmail(), finalEmail, "ecm123");

        return "Xác thực thành công! Kiểm tra email để lấy thông tin đăng nhập.";
    }

    // --- HÀM PRIVATE (SUPPORT) ---

    // Hàm này giúp tránh lặp code sinh email ở 2 nơi
    private String generateUniqueEcmEmail(String firstName, String lastName) {
        String prefix = EmailUtils.generateEmailPrefix(firstName, lastName);
        String emailDomain = "@ecm.edu.vn";
        String finalEmail = prefix + emailDomain;

        int count = 0;
        while (userRepository.existsByEmail(finalEmail)) {
            count++;
            finalEmail = prefix + count + emailDomain;
        }
        return finalEmail;
    }

    // Gỡ học sinh khỏi trung tâm (Unlink)
    public void removeStudentFromCenter(Long studentId, Long centerId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Học sinh không tồn tại"));

        Center center = centerRepository.findById(centerId)
                .orElseThrow(() -> new RuntimeException("Trung tâm không tồn tại"));

        // Xóa center khỏi danh sách liên kết của student
        student.getConnectedCenters().remove(center);

        // Lưu lại (JPA sẽ tự xóa dòng trong bảng trung gian student_centers)
        userRepository.save(student);
    }

    // Xóa vĩnh viễn học sinh (Hard Delete)
    public void deleteStudentPermanently(Long studentId) {
        // Có thể cần check xem học sinh có đang nợ phí hay đang học dở không
        // Tạm thời xóa thẳng tay (Cascade sẽ xóa enrollment liên quan nếu cấu hình
        // đúng)
        userRepository.deleteById(studentId);
    }

    // Cập nhật thông tin học sinh
    public User updateStudent(Long id, CreateStudentRequest request) {
        User student = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Học sinh không tồn tại"));

        // Chỉ cho phép sửa các thông tin cơ bản
        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setPhoneNumber(request.getPhoneNumber());
        student.setDateOfBirth(request.getDateOfBirth());

        // Lưu ý: Không cho phép đổi Email hay Password ở đây

        return userRepository.save(student);
    }
}