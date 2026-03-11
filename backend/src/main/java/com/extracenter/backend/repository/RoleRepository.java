package com.extracenter.backend.repository;

import com.extracenter.backend.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    // This method helps find a Role by its exact name (e.g., find the role named
    // "STUDENT" or "TEACHER")
    // Returning an Optional is a best practice to safely handle cases where the
    // role might not exist.
    Optional<Role> findByName(String name);
}