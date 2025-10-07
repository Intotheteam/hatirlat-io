package com.hatirlat.backend.repository;

import com.hatirlat.backend.entity.CustomRepeatConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomRepeatConfigRepository extends JpaRepository<CustomRepeatConfig, Long> {
}