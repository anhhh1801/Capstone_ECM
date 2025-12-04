package com.extracenter.backend.config;

import com.extracenter.backend.utils.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Lấy token từ header "Authorization"
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7); // Cắt bỏ chữ "Bearer "

            // 2. Kiểm tra token có chuẩn không
            if (jwtUtils.validateToken(token)) {
                String email = jwtUtils.extractEmail(token);

                // 3. Nếu token chuẩn, báo cho Spring Security biết là user này đã đăng nhập
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(email,
                        null, new ArrayList<>());

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }
}