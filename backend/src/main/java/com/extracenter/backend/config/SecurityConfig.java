package com.extracenter.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import jakarta.servlet.DispatcherType;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

        @Autowired
        private JwtAuthenticationFilter jwtAuthenticationFilter;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(csrf -> csrf.disable())
                                .cors(cors -> cors.configure(http))
                                .authorizeHttpRequests(auth -> auth
                                                .dispatcherTypeMatchers(DispatcherType.ERROR, DispatcherType.FORWARD)
                                                .permitAll()
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                                .requestMatchers(
                                                                "/api/users/login",
                                                                "/api/users/register-teacher",
                                                                "/api/users/verify-otp",
                                                                "/api/users/resend-otp",
                                                                "/error")
                                                .permitAll()

                                                .requestMatchers("/api/users/admin/**")
                                                .hasAnyAuthority("ADMIN", "ROLE_ADMIN")
                                                .requestMatchers("/api/users/teacher/**", "/api/users/create-student", "/api/users/search")
                                                .hasAnyAuthority("TEACHER", "ROLE_TEACHER", "MANAGER", "ROLE_MANAGER", "ADMIN", "ROLE_ADMIN")
                                                .requestMatchers("/api/schedule/teacher/**", "/api/courses/teacher/**", "/api/courses/invitations/**", "/api/centers/teacher/**", "/api/centers/teaching/**")
                                                .hasAnyAuthority("TEACHER", "ROLE_TEACHER", "MANAGER", "ROLE_MANAGER", "ADMIN", "ROLE_ADMIN")
                                                .requestMatchers("/api/centers/**")
                                                .hasAnyAuthority("TEACHER", "ROLE_TEACHER", "MANAGER", "ROLE_MANAGER", "ADMIN", "ROLE_ADMIN")
                                                .requestMatchers("/api/schedule/student/**", "/api/courses/student/**", "/api/assignments/student/**")
                                                .hasAnyAuthority("STUDENT", "ROLE_STUDENT", "ADMIN", "ROLE_ADMIN")

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
                                                                "ADMIN", "ROLE_ADMIN", "STUDENT", "ROLE_STUDENT")
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