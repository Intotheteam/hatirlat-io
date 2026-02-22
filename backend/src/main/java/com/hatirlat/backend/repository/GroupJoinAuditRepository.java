package com.hatirlat.backend.repository;

import com.hatirlat.backend.entity.GroupJoinAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface GroupJoinAuditRepository extends JpaRepository<GroupJoinAudit, Long> {

    long countByGroupIdAndIpAddressAndJoinedAtAfter(Long groupId, String ipAddress, LocalDateTime since);
}
