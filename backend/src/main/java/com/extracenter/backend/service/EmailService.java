package com.extracenter.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // Gửi mail xác nhận (Dùng OTP 6 số)
    public void sendVerificationEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("[ECM] Mã xác thực tài khoản Giáo viên");

        // Nội dung mail chuyên nghiệp hơn
        String content = "Xin chào,\n\n" +
                "Cảm ơn bạn đã đăng ký tài khoản tại ECM System.\n" +
                "Mã xác thực (OTP) của bạn là:\n\n" +
                "   " + otp + "\n\n" +
                "Mã này sẽ hết hạn sau 10 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.\n\n" +
                "Trân trọng,\n" +
                "Đội ngũ ECM";

        message.setText(content);

        mailSender.send(message);
    }

    // Gửi mail chứa tài khoản & mật khẩu (Bước 2 - Giữ nguyên logic)
    public void sendCredentialEmail(String toEmail, String newAccountEmail, String password) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("[ECM] Đăng ký thành công - Thông tin đăng nhập");
        message.setText("Chào mừng giáo viên mới,\n\n" +
                "Tài khoản của bạn đã được tạo thành công.\n" +
                "---------------------------------\n" +
                "Email đăng nhập: " + newAccountEmail + "\n" +
                "Mật khẩu: " + password + "\n" +
                "---------------------------------\n" +
                "Vui lòng đổi mật khẩu ngay sau khi đăng nhập lần đầu.");

        mailSender.send(message);
    }
}