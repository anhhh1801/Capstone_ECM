package com.extracenter.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.extracenter.backend.entity.Grade;

public interface GradeRepository extends JpaRepository<Grade, Long> {
    List<Grade> findByCenterId(Long centerId);
}
