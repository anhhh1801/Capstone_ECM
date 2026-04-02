package com.extracenter.backend.config;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.extracenter.backend.entity.User;
import com.extracenter.backend.repository.UserRepository;
import com.extracenter.backend.utils.JwtUtils;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    @Override
        protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Lấy token từ header "Authorization"
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            if (jwtUtils.validateToken(token)) {
                String email = jwtUtils.extractEmail(token);

                User user = userRepository.findByEmail(email).orElse(null);
                if (user == null || !user.isEnabled() || user.isLocked()) {
                    SecurityContextHolder.clearContext();
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Account is no longer active.");
                    return;
                }

                String role = jwtUtils.extractRole(token);

                List<GrantedAuthority> authorities = new ArrayList<>();

                if (role != null && !role.trim().isEmpty()) {
                    String normalizedRole = role.toUpperCase().trim();
                    authorities.add(new SimpleGrantedAuthority(normalizedRole));
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + normalizedRole));
                }

                // 3. Nếu token chuẩn, báo cho Spring Security biết là user này đã đăng nhập
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(email,
                        null, authorities);

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }
}