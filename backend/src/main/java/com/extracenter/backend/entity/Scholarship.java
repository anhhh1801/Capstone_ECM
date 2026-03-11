package com.extracenter.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Scholarship")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Scholarship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The name of the scholarship or discount program
    // Example: "Academic Excellence", "Sibling Discount", "10% Off"
    @Column(nullable = false)
    private String name;

    // The percentage of the discount applied
    // Example: 0.1 represents a 10% discount, 0.5 represents 50%
    private Float discountPercentage;
}