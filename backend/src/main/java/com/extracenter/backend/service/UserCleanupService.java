package com.extracenter.backend.service;

import com.extracenter.backend.entity.User;
import com.extracenter.backend.entity.VerificationToken;
import com.extracenter.backend.repository.UserRepository;
import com.extracenter.backend.repository.VerificationTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional // Để đảm bảo xóa Token xong thì xóa User luôn, lỗi thì hoàn tác
public class UserCleanupService {

    @Autowired
    private VerificationTokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    // Chạy mỗi 1 tiếng một lần (3600000 ms)
    // Hoặc dùng cron = "0 0 0 * * ?" để chạy lúc 12h đêm hàng ngày
    @Scheduled(fixedRate = 3600000)
    public void removeUnverifiedUsers() {
        System.out.println("🧹 Đang quét dọn các tài khoản rác...");

        // 1. Tìm các token đã hết hạn (ExpiryDate < Bây giờ)
        List<VerificationToken> expiredTokens = tokenRepository.findAllByExpiryDateBefore(LocalDateTime.now());

        int deletedCount = 0;

        for (VerificationToken token : expiredTokens) {
            User user = token.getUser();

            // CHỈ XÓA NẾU: User đó chưa kích hoạt (isEnabled = false)
            // Nếu user đã kích hoạt rồi mà token hết hạn thì kệ (vì họ đã là user thật)
            if (!user.isEnabled()) {
                // Xóa Token trước (vì Token dính khóa ngoại với User)
                tokenRepository.delete(token);

                // Xóa User rác
                userRepository.delete(user);

                deletedCount++;
            }
        }

        if (deletedCount > 0) {
            System.out.println("✅ Đã xóa vĩnh viễn " + deletedCount + " tài khoản rác chưa xác thực!");
        } else {
            System.out.println("✨ Không có tài khoản rác nào.");
        }
    }
}