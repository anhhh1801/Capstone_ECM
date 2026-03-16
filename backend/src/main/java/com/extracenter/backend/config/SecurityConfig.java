package com.extracenter.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import jakarta.servlet.DispatcherType;

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
                                                .dispatcherTypeMatchers(DispatcherType.ERROR, DispatcherType.FORWARD)
                                                .permitAll()
                                                // Cho phép các API này truy cập tự do (không cần token)
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                                .requestMatchers(
                                                                "/api/users/login",
                                                                "/api/users/register",
                                                                "/api/users/register-teacher",
                                                                "/api/users/verify-otp",
                                                                "/api/users/resend-otp",
                                                                "/error")
                                                .permitAll()

                                                // Thêm dòng này vào SecurityConfig
                                                // Sửa lại 3 dòng này trong SecurityConfig.java
                                                .requestMatchers(HttpMethod.POST, "/api/courses", "/api/courses/**")
                                                .hasAnyAuthority("TEACHER", "ROLE_TEACHER", "MANAGER", "ROLE_MANAGER",
                                                                "ADMIN", "ROLE_ADMIN")
                                                .requestMatchers(HttpMethod.PUT, "/api/courses", "/api/courses/**")
                                                .hasAnyAuthority("TEACHER", "ROLE_TEACHER", "MANAGER", "ROLE_MANAGER",
                                                                "ADMIN", "ROLE_ADMIN")
                                                .requestMatchers(HttpMethod.DELETE, "/api/courses", "/api/courses/**")
                                                .hasAnyAuthority("TEACHER", "ROLE_TEACHER", "MANAGER", "ROLE_MANAGER",
                                                                "ADMIN", "ROLE_ADMIN")
                                                .requestMatchers("/api/materials", "/api/materials/**")
                                                .hasAnyAuthority("TEACHER", "ROLE_TEACHER", "MANAGER", "ROLE_MANAGER",
                                                                "ADMIN", "ROLE_ADMIN")
                                                .requestMatchers("/api/assignments", "/api/assignments/**")
                                                .hasAnyAuthority("TEACHER", "ROLE_TEACHER", "MANAGER", "ROLE_MANAGER",
                                                                "ADMIN", "ROLE_ADMIN", "STUDENT", "ROLE_STUDENT")
                                                // Tất cả các API khác BẮT BUỘC phải có Token
                                                .anyRequest().authenticated())
                                // Thêm Filter JWT vào trước filter mặc định
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }
}