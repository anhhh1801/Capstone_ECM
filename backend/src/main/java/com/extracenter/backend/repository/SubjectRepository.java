package com.extracenter.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.extracenter.backend.entity.Subject;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByCenterId(Long centerId);
}

