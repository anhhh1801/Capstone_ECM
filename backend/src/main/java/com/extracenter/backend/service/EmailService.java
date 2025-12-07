package com.extracenter.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // Send verification email (Using 6-digit OTP)
    public void sendVerificationEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("[ECM] Teacher Account Verification Code");

        // Professional English content
        String content = "Hello,\n\n" +
                "Thank you for registering with the ECM System.\n" +
                "Your verification code (OTP) is:\n\n" +
                "    " + otp + "\n\n" +
                "This code will expire in 10 minutes. Please do not share this code with anyone.\n\n" +
                "Best regards,\n" +
                "The ECM Team";

        message.setText(content);

        mailSender.send(message);
    }

    // Send email with credentials (Step 2 - Logic preserved)
    public void sendCredentialEmail(String toEmail, String newAccountEmail, String password) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("[ECM] Registration Successful - Login Credentials");

        message.setText("Welcome new teacher,\n\n" +
                "Your account has been successfully created.\n" +
                "---------------------------------\n" +
                "Login Email: " + newAccountEmail + "\n" +
                "Password: " + password + "\n" +
                "---------------------------------\n" +
                "Please change your password immediately after your first login.");

        mailSender.send(message);
    }
}