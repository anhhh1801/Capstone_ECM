package com.extracenter.backend.repository;

import com.extracenter.backend.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    // Hàm này giúp tìm Role bằng tên (ví dụ: tìm role có tên "STUDENT")
    Optional<Role> findByName(String name);
}