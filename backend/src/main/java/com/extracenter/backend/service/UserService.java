package com.extracenter.backend.service;

import com.extracenter.backend.dto.*;
import com.extracenter.backend.entity.*;
import com.extracenter.backend.repository.*;
import com.extracenter.backend.utils.EmailUtils;
import com.extracenter.backend.utils.JwtUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
    @Autowired
    private JwtUtils jwtUtils;

    /**
     * Authenticates a user and returns a token with filtered user info.
     */
    public LoginResponse loginUser(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password!"));

        // SECURITY WARNING: In a production app, use BCryptPasswordEncoder here!
        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid email or password!");
        }

        if (user.isLocked()) {
            throw new RuntimeException("Your account is locked. Please contact admin@ecm.edu.vn.");
        }

        if (!user.isEnabled()) {
            handleResendingOtp(user);
            throw new RuntimeException("ACCOUNT_DEACTIVATED");
        }

        String token = jwtUtils.generateToken(user);

        // 1. Map Entity collection to a List of IDs using Java Streams
        List<Long> centerIds = user.getConnectedCenters().stream()
                .map(Center::getId)
                .collect(Collectors.toList());

        // 2. Map Entity to DTO to avoid leaking sensitive data (like password) to the
        // frontend
        LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().getName(),
                centerIds // Passing the newly created list of IDs!
        );

        return new LoginResponse(token, userInfo);
    }

    /**
     * Private helper to handle OTP logic during login attempts for disabled
     * accounts.
     */
    private void handleResendingOtp(User user) {
        VerificationToken existingToken = tokenRepository.findByUser(user).orElse(null);

        if (existingToken != null && existingToken.getExpiryDate().isAfter(LocalDateTime.now())) {
            throw new RuntimeException("PENDING_VERIFICATION");
        }

        if (existingToken != null) {
            tokenRepository.delete(existingToken);
        }

        String otp = generateOTP();
        VerificationToken newToken = new VerificationToken(user, otp);
        tokenRepository.save(newToken);

        emailService.sendVerificationEmail(user.getPersonalEmail(), otp);
    }

    public User updateProfile(Long id, UpdateProfileRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setDateOfBirth(request.getDateOfBirth());

        return userRepository.save(user);
    }

    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        if (!user.getPassword().equals(request.getOldPassword())) {
            throw new RuntimeException("Incorrect old password!");
        }
        user.setPassword(request.getNewPassword());
        userRepository.save(user);
    }

    public String toggleUserLock(Long adminId, Long targetUserId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found!"));
        if (!"ADMIN".equals(admin.getRole().getName())) {
            throw new RuntimeException("You do not have permission to perform this action!");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Target user not found!"));

        boolean newStatus = !targetUser.isLocked();
        targetUser.setLocked(newStatus);
        userRepository.save(targetUser);

        return newStatus ? "Account has been locked." : "Account has been unlocked.";
    }

    public UserStatsResponse getUserStats(Long adminId, Long targetUserId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found!"));

        if (!"ADMIN".equals(admin.getRole().getName())) {
            throw new RuntimeException("Unauthorized");
        }

        long centers = userRepository.countCentersByUserId(targetUserId);
        long courses = courseRepository.countByTeacherId(targetUserId);
        long students = courseRepository.countStudentsByTeacherId(targetUserId);

        return UserStatsResponse.builder()
                .userId(targetUserId)
                .totalCenters(centers)
                .totalCourses(courses)
                .totalStudents(students)
                .totalTeachers(userRepository.countByRoleName("TEACHER"))
                .build();
    }

    @Transactional
    public User updateStudent(Long id, CreateStudentRequest request) {
        User student = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found!"));

        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setPhoneNumber(request.getPhoneNumber());
        student.setDateOfBirth(request.getDateOfBirth());

        return userRepository.save(student);
    }

    // 2. Deactivate an Account (e.g., Soft delete or suspending a user)
    @Transactional
    public User deactivateAccount(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        user.setEnabled(false); // Locks the user out of logging in
        return userRepository.save(user);
    }

    // 3. Resend OTP to the user's personal email
    @Transactional
    public String resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found!"));

        if (user.isEnabled()) {
            throw new RuntimeException("This account is already activated!");
        }

        // Find existing token or create a new one safely
        VerificationToken token = tokenRepository.findByUser(user).orElse(null);
        String newOtp = generateOTP();

        if (token == null) {
            token = new VerificationToken(user, newOtp);
        } else {
            token.setToken(newOtp);
            token.setExpiryDate(java.time.LocalDateTime.now().plusMinutes(10)); // Reset timer
        }

        tokenRepository.save(token);
        emailService.sendVerificationEmail(user.getPersonalEmail(), newOtp);

        return "A new OTP has been sent to your email.";
    }

    @Transactional
    public User createStudentAutoEmail(CreateStudentRequest request) {
        String finalEmail = generateUniqueEcmEmail(request.getFirstName(), request.getLastName());

        Center center = centerRepository.findById(request.getCenterId())
                .orElseThrow(() -> new RuntimeException("Center not found!"));

        User newUser = new User();
        newUser.setFirstName(request.getFirstName());
        newUser.setLastName(request.getLastName());
        newUser.setEmail(finalEmail);
        newUser.setPersonalEmail(finalEmail);
        newUser.setPhoneNumber(request.getPhoneNumber());
        newUser.setDateOfBirth(request.getDateOfBirth());
        newUser.setPassword("ecm123");
        newUser.setEnabled(true);
        newUser.getConnectedCenters().add(center);

        Role studentRole = roleRepository.findByName("STUDENT")
                .orElseThrow(() -> new RuntimeException("Student role not found!"));
        newUser.setRole(studentRole);

        return userRepository.save(newUser);
    }

    @Transactional
    public void connectStudentToCenter(Long studentId, Long centerId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found!"));
        Center center = centerRepository.findById(centerId)
                .orElseThrow(() -> new RuntimeException("Center not found!"));

        // FIX: Use the Set<Center> connectedCenters
        student.getConnectedCenters().add(center);
        userRepository.save(student);
    }

    @Transactional
    public void removeStudentFromCenter(Long studentId, Long centerId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found!"));
        Center center = centerRepository.findById(centerId)
                .orElseThrow(() -> new RuntimeException("Center not found!"));

        // Safely remove the center from the student's Many-To-Many set
        student.getConnectedCenters().remove(center);

        // Save the student to update the join table (student_centers)
        userRepository.save(student);
    }

    @Transactional
    public String registerTeacher(RegisterRequest request) {
        Optional<User> existingUserOpt = userRepository.findByEmail(request.getPersonalEmail());

        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            VerificationToken waitingVerifyToken = tokenRepository.findByUser(existingUser).orElse(null);

            if (waitingVerifyToken != null) {
                throw new RuntimeException("PENDING_VERIFICATION");
            }
            if (existingUser.isEnabled()) {
                throw new RuntimeException("This email is already registered and active!");
            } else {
                throw new RuntimeException("This email is registered but deactivated.");
            }
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPersonalEmail(request.getPersonalEmail());
        user.setEmail(request.getPersonalEmail());
        user.setPassword(java.util.UUID.randomUUID().toString());
        user.setEnabled(false);
        user.setCreatedDate(LocalDateTime.now());

        Role teacherRole = roleRepository.findByName("TEACHER")
                .orElseThrow(() -> new RuntimeException("Teacher role not found!"));
        user.setRole(teacherRole);

        userRepository.save(user);

        String otp = generateOTP();
        VerificationToken token = new VerificationToken(user, otp);
        tokenRepository.save(token);

        emailService.sendVerificationEmail(user.getPersonalEmail(), otp);

        return "Verification email sent.";
    }

    @Transactional
    public String verifyAccount(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found!"));

        if (user.isEnabled()) {
            return "This account is already activated!";
        }

        VerificationToken vt = tokenRepository.findByUser(user).orElse(null);

        if (vt == null || !vt.getToken().equals(otp) || vt.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invalid or expired OTP!");
        }

        if (!user.getEmail().equals(user.getPersonalEmail())) {
            user.setEnabled(true);
            userRepository.save(user);
            tokenRepository.delete(vt);
            return "Account reactivated.";
        } else {
            String finalEmail = generateUniqueEcmEmail(user.getFirstName(), user.getLastName());
            user.setEmail(finalEmail);
            user.setPassword("ecm123");
            user.setEnabled(true);

            userRepository.save(user);
            tokenRepository.delete(vt);

            emailService.sendCredentialEmail(user.getPersonalEmail(), finalEmail, "ecm123");
            return "Success! Your ECM email is: " + finalEmail;
        }
    }

    private String generateOTP() {
        int randomPin = (int) (Math.random() * 900000) + 100000;
        return String.valueOf(randomPin);
    }

    private String generateUniqueEcmEmail(String firstName, String lastName) {
        String prefix = EmailUtils.generateEmailPrefix(firstName, lastName);
        String finalEmail = prefix + "@ecm.edu.vn";

        int count = 0;
        while (userRepository.existsByEmail(finalEmail)) {
            count++;
            finalEmail = prefix + count + "@ecm.edu.vn";
        }
        return finalEmail;
    }

    @Transactional
    public void deleteStudentPermanently(Long studentId) {
        userRepository.deleteById(studentId);
    }
}