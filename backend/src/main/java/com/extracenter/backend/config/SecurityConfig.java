package com.extracenter.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Tắt CSRF
                .cors(cors -> cors.configure(http)) // Kích hoạt CORS
                .authorizeHttpRequests(auth -> auth
                        // Cho phép các API này truy cập tự do (không cần token)
                        .requestMatchers(
                                "/api/users/login",
                                "/api/users/register",
                                "/api/users/register-teacher",
                                "/api/users/verify-otp",
                                "/api/users/resend-otp")
                        .permitAll()

                        // Tất cả các API khác BẮT BUỘC phải có Token
                        .anyRequest().authenticated())
                // Thêm Filter JWT vào trước filter mặc định
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}