package com.hatirlat.backend.repository;

import com.hatirlat.backend.entity.Group;
import com.hatirlat.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {

    @Query("SELECT g FROM Group g")
    List<Group> findAllGroups();

    List<Group> findByOwner(User owner);

    Page<Group> findByOwner(User owner, Pageable pageable);

    Optional<Group> findByInviteCode(String inviteCode);

    long countByOwner(User owner);
}