package com.extracenter.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "User")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(unique = true)
    private String email;

    @Column(nullable = false)
    private String password; // We will hash this later!

    private String phoneNumber;

    private LocalDate dateOfBirth;

    private String avatarImg;

    @Column(name = "created_date")
    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(columnDefinition = "boolean default false")
    private boolean isLocked = false;

    @Column(nullable = false, unique = true)
    private String personalEmail;

    private boolean isEnabled = false;

    // RELATIONSHIP: Many Users can have One Role
    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @OneToMany(mappedBy = "teacher")
    @JsonIgnore // Thêm dòng này: Khi in User ra JSON, đừng in danh sách khóa học (để tránh
                // nặng)
    private List<Course> courses;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "student_centers", // Tên bảng trung gian
            joinColumns = @JoinColumn(name = "student_id"), inverseJoinColumns = @JoinColumn(name = "center_id"))
    private Set<Center> connectedCenters = new HashSet<>();

    // Getter & Setter
    public Set<Center> getConnectedCenters() {
        return connectedCenters;
    }

    public void setConnectedCenters(Set<Center> connectedCenters) {
        this.connectedCenters = connectedCenters;
    }
}