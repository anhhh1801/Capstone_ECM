package com.extracenter.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // Gửi mail xác nhận (Bước 1)
    public void sendVerificationEmail(String toEmail, String token) {
        String link = "http://localhost:3000/verify?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("[ECM] Xác nhận đăng ký tài khoản Giáo viên");
        message.setText("Chào bạn,\n\n" +
                "Vui lòng nhấn vào link sau để kích hoạt tài khoản và nhận thông tin đăng nhập:\n" +
                link + "\n\n" +
                "Link này sẽ hết hạn sau 24h.");

        mailSender.send(message);
    }

    // Gửi mail chứa tài khoản & mật khẩu (Bước 2)
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
                "Vui lòng đổi mật khẩu ngay sau khi đăng nhập.");

        mailSender.send(message);
    }
}