package com.extracenter.backend.dto;

import java.time.LocalDate;

import com.extracenter.backend.entity.Role;
import com.extracenter.backend.entity.User;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String personalEmail;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private Role role;
    private String avatarImg;

    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPersonalEmail(),
                user.getPhoneNumber(),
                user.getDateOfBirth(),
                user.getRole(),
                user.getAvatarImg());
    }
}