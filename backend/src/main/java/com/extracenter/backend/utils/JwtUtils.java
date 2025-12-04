package com.extracenter.backend.utils;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import com.extracenter.backend.entity.User;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    // Khóa bí mật (Nên để phức tạp và giấu trong file cấu hình .env)
    private static final String SECRET_KEY = "DayLaKhoaBiMatCuaECMSystemRatDaiVaPhucTapDeBaoMat123456";

    // Thời gian hết hạn: 24 giờ (tính bằng mili giây)
    private static final long EXPIRATION_TIME = 86400000;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    // 1. Tạo Token từ User
    public String generateToken(User user) {
        return Jwts.builder()
                .setSubject(user.getEmail()) // Lưu email vào token
                .claim("role", user.getRole().getName()) // Lưu quyền (Role)
                .claim("userId", user.getId()) // Lưu ID
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // 2. Lấy Email từ Token
    public String extractEmail(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // 3. Kiểm tra Token có hợp lệ không
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            System.out.println("Token không hợp lệ: " + e.getMessage());
            return false;
        }
    }
}