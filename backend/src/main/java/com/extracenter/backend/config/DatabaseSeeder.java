package com.extracenter.backend.config;

import com.extracenter.backend.entity.Role;
import com.extracenter.backend.entity.User;
import com.extracenter.backend.repository.RoleRepository;
import com.extracenter.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        // 1. Create Roles if they don't exist
        createRoleIfNotFound("ADMIN");
        createRoleIfNotFound("TEACHER");
        createRoleIfNotFound("STUDENT");

        // 2. Create Admin Account if it doesn't exist
        createAdminIfNotFound();
    }

    private void createRoleIfNotFound(String name) {
        if (roleRepository.findByName(name).isEmpty()) {
            Role role = new Role();
            role.setName(name);
            roleRepository.save(role);
            System.out.println("✅ Role created: " + name);
        }
    }

    private void createAdminIfNotFound() {
        String adminEmail = "admin@ecm.edu.vn";

        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            Role adminRole = roleRepository.findByName("ADMIN").get();

            User admin = new User();
            admin.setFirstName("Super");
            admin.setLastName("Admin");
            admin.setEmail(adminEmail);
            admin.setPersonalEmail(adminEmail); // Fill this to avoid null errors
            admin.setPassword("admin123"); // Default Password
            admin.setRole(adminRole);

            admin.setEnabled(true); // Auto activate
            admin.setLocked(false); // Not locked

            // Set created date (if you added that field)
            admin.setCreatedDate(java.time.LocalDateTime.now());

            userRepository.save(admin);
            System.out.println("🚀 Default Admin Account Created: " + adminEmail + " / admin123");
        }
    }
}