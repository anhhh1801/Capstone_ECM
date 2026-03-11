package com.extracenter.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Role")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The name of the role (e.g., "ADMIN", "TEACHER", "STUDENT")
    // Must be unique so we don't accidentally create two "TEACHER" roles.
    @Column(nullable = false, unique = true)
    private String name;
}