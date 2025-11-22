package com.extracenter.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Role") // Maps to the 'Role' table in MySQL
@Data // Generates Getters, Setters, toString, etc.
@NoArgsConstructor // Generates empty constructor
@AllArgsConstructor // Generates constructor with all fields
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment ID
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g., "ADMIN", "TEACHER", "STUDENT"
}