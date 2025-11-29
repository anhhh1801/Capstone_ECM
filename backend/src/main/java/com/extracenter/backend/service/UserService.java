package com.extracenter.backend.service;

import com.extracenter.backend.dto.ChangePasswordRequest;
import com.extracenter.backend.dto.CreateStudentRequest;
import com.extracenter.backend.dto.LoginRequest;
import com.extracenter.backend.dto.RegisterRequest;
import com.extracenter.backend.dto.UpdateProfileRequest;
import com.extracenter.backend.dto.UserStatsResponse;
import com.extracenter.backend.entity.Center;
import com.extracenter.backend.entity.Role;
import com.extracenter.backend.entity.User;
import com.extracenter.backend.entity.VerificationToken;
import com.extracenter.backend.repository.CenterRepository;
import com.extracenter.backend.repository.CourseRepository;
import com.extracenter.backend.repository.RoleRepository;
import com.extracenter.backend.repository.UserRepository;
import com.extracenter.backend.repository.VerificationTokenRepository;
import com.extracenter.backend.service.EmailUtils;

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
    @Autowired
    private CourseRepository courseRepository;

    public User loginUser(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user != null) {
            if (!user.getPassword().equals(request.getPassword())) {
                throw new RuntimeException("Sai email hoặc mật khẩu!");
            }

            if (user.isLocked()) {
                throw new RuntimeException(
                        "Your account is locked by admin. Please contact admin@ecm.edu.vn.");
            }

            if (!user.isEnabled()) {

                VerificationToken existingToken = tokenRepository.findByUser(user);

                if (existingToken != null && existingToken.getExpiryDate().isAfter(java.time.LocalDateTime.now())) {
                    throw new RuntimeException("PENDING_VERIFICATION");
                }

                if (existingToken != null)
                    tokenRepository.delete(existingToken);

                String otp = generateOTP();
                VerificationToken newToken = new VerificationToken(user, otp);
                tokenRepository.save(newToken);

                emailService.sendVerificationEmail(user.getPersonalEmail(), otp);

                throw new RuntimeException("ACCOUNT_DEACTIVATED");
            }

            return user;
        }
        return null;
    }

    public User deactivateAccount(Long id) {
        User user = userRepository.findById(id).orElse(null);

        user.setEnabled(false);
        return userRepository.save(user);
    };

    public User updateProfile(Long id, UpdateProfileRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User không tồn tại!"));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setDateOfBirth(request.getDateOfBirth());

        return userRepository.save(user);
    }

    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại!"));

        if (!user.getPassword().equals(request.getOldPassword())) {
            throw new RuntimeException("Mật khẩu cũ không chính xác!");
        }
        user.setPassword(request.getNewPassword());

        userRepository.save(user);
    }

    // Lock or Unlock User
    public String toggleUserLock(Long adminId, Long targetUserId) {
        // Optional: Check if adminId is actually an ADMIN
        User admin = userRepository.findById(adminId).orElseThrow();
        if (!admin.getRole().getName().equals("ADMIN")) {
            throw new RuntimeException("Bạn không có quyền thực hiện thao tác này!");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // Toggle status
        boolean newStatus = !targetUser.isLocked();
        targetUser.setLocked(newStatus);
        userRepository.save(targetUser);

        return newStatus ? "Đã khóa tài khoản này." : "Đã mở khóa tài khoản này.";
    }

    public UserStatsResponse getUserStats(Long adminId, Long targetUserId) {
        // Optional: Check permission
        User admin = userRepository.findById(adminId).orElseThrow();
        if (!admin.getRole().getName().equals("ADMIN")) {
            throw new RuntimeException("Unauthorized");
        }

        // Calculate Stats
        long centers = userRepository.countCentersByUserId(targetUserId);
        long courses = courseRepository.countByTeacherId(targetUserId);
        long students = courseRepository.countStudentsByTeacherId(targetUserId);

        return new UserStatsResponse(targetUserId, centers, courses, students);
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
        newUser.setPersonalEmail(finalEmail);
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

    private String generateOTP() {
        int randomPin = (int) (Math.random() * 900000) + 100000;
        return String.valueOf(randomPin);
    }

    // 4. GIAI ĐOẠN 1: Giáo viên đăng ký tạm (Gửi mail verify)
    public String registerTeacher(RegisterRequest request) {
        Optional<User> existingUserOpt = userRepository.findByEmail(request.getPersonalEmail());

        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            VerificationToken waitingVerifyToken = tokenRepository.findByUser(existingUser);

            if (waitingVerifyToken != null) {
                throw new RuntimeException("PENDING_VERIFICATION");
            }
            if (existingUser.isEnabled()) {
                throw new RuntimeException("Email này đã được đăng ký và đang hoạt động!");
            } else {
                throw new RuntimeException("Email này đã được đăng ký nhưng đang ngưng hoạt động!");
            }

        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        user.setPersonalEmail(request.getPersonalEmail());
        user.setEmail(request.getPersonalEmail());

        user.setPassword(java.util.UUID.randomUUID().toString());
        user.setEnabled(false);

        user.setCreatedDate(java.time.LocalDateTime.now());

        Role teacherRole = roleRepository.findByName("TEACHER").orElseThrow();
        user.setRole(teacherRole);

        userRepository.save(user);

        String otp = generateOTP();
        VerificationToken token = new VerificationToken(user, otp);
        tokenRepository.save(token);

        emailService.sendVerificationEmail(user.getPersonalEmail(), otp);

        return "Đã gửi mail xác nhận. Vui lòng kiểm tra hòm thư!";
    }

    // NEW FUNCTION: Resend OTP (Replaces the old one)
    public String resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại!"));

        if (user.isEnabled()) {
            throw new RuntimeException("Tài khoản này đã được kích hoạt rồi!");
        }

        // Find existing token
        VerificationToken token = tokenRepository.findByUser(user);

        // Generate NEW OTP
        String newOtp = generateOTP();

        if (token == null) {
            // Should rarely happen, but create new if missing
            token = new VerificationToken(user, newOtp);
        } else {
            // UPDATE existing token
            token.setToken(newOtp);
            token.setExpiryDate(LocalDateTime.now().plusMinutes(10)); // Reset timer
        }

        tokenRepository.save(token); // Save updates

        // Send Email
        emailService.sendVerificationEmail(user.getPersonalEmail(), newOtp);

        return "Mã OTP mới đã được gửi lại vào email của bạn.";
    }

    // 5. GIAI ĐOẠN 2: Xác thực & Tạo tài khoản thật
    public String verifyAccount(String email, String otp) {
        User user = userRepository.findByEmail(email).orElse(null); // Or findByEmail depending on your logic
        if (user == null) {
            return "Email không tồn tại!";
        }

        if (user.isEnabled()) {
            return "Tài khoản này đã được kích hoạt rồi!";
        }

        // Find the token associated with this user
        VerificationToken vt = tokenRepository.findByUser(user);

        if (vt == null || !vt.getToken().equals(otp) || vt.getExpiryDate().isBefore(LocalDateTime.now())) {
            return "Mã OTP không đúng hoặc đã hết hạn!";
        }
        if (!user.getEmail().equals(user.getPersonalEmail())) {

            // CASE 1: OLD USER REACTIVATING
            // We ONLY set enabled = true.
            // We do NOT generate a new email or password.
            user.setEnabled(true);
            userRepository.save(user);
            tokenRepository.delete(vt);

            return "Xác thực thành công! Tài khoản của bạn đã được kích hoạt lại.";

        } else {

            String finalEmail = generateUniqueEcmEmail(user.getFirstName(), user.getLastName());
            user.setEmail(finalEmail);
            user.setPassword("ecm123");
            user.setEnabled(true);

            userRepository.save(user);
            tokenRepository.delete(vt);

            emailService.sendCredentialEmail(user.getPersonalEmail(), finalEmail, "ecm123");

            return "Xác thực thành công! Tài khoản của bạn là: " + finalEmail;
        }
    };

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