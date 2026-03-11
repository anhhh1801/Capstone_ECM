package com.extracenter.backend.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PreRemove;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "User")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    // Typically the institutional/school email used for login
    @Column(unique = true)
    private String email;

    @Column(nullable = false)
    @JsonIgnore
    private String password;

    private String phoneNumber;

    private LocalDate dateOfBirth;

    private String avatarImg;

    // updatable = false ensures the creation date cannot be accidentally modified
    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(columnDefinition = "boolean default false")
    private boolean isLocked = false;

    // Backup/Recovery email, must be unique
    @Column(nullable = false, unique = true)
    private String personalEmail;

    // Used for OTP verification status
    private boolean isEnabled = false;

    // RELATIONSHIP: What role does this user have? (ADMIN, TEACHER, STUDENT)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private Role role;

    // --- RELATIONSHIPS ---

    // 1. Courses taught by this user (if they are a Teacher)
    // WARNING: CascadeType.ALL means if you delete this Teacher, ALL of their
    // courses are deleted!
    // In a real production environment, you might want to prevent deletion or
    // reassign the course.
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Course> courses;

    // 2. Courses this user is enrolled in (if they are a Student)
    // CascadeType.ALL + orphanRemoval = true: Deleting the User safely deletes
    // their Enrollment history.
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Enrollment> enrollments;

    // 3. Centers this user is connected to
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "student_centers", joinColumns = @JoinColumn(name = "student_id"), inverseJoinColumns = @JoinColumn(name = "center_id"))
    @JsonIgnore
    private Set<Center> connectedCenters = new HashSet<>();

    // Safely remove ManyToMany relationships before deleting the User
    // to prevent Foreign Key constraint errors.
    @PreRemove
    private void preRemove() {
        this.connectedCenters.clear();
    }
}