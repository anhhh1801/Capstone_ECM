package com.extracenter.backend.repository;

import com.extracenter.backend.entity.Scholarship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ScholarshipRepository extends JpaRepository<Scholarship, Long> {

    // Find a scholarship by its exact name (e.g., "10% Early Bird")
    Optional<Scholarship> findByName(String name);

    // Basic CRUD operations (findAll, save, delete) are already provided by
    // JpaRepository!
}