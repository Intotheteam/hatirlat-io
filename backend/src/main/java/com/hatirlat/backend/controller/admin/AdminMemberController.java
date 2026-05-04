package com.hatirlat.backend.controller.admin;

import com.hatirlat.backend.dto.AdminMemberResponse;
import com.hatirlat.backend.dto.BaseResponse;
import com.hatirlat.backend.entity.Group;
import com.hatirlat.backend.entity.GroupMember;
import com.hatirlat.backend.entity.Member;
import com.hatirlat.backend.repository.GroupMemberRepository;
import com.hatirlat.backend.repository.GroupRepository;
import com.hatirlat.backend.repository.MemberRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/members")
@Tag(name = "Admin Members", description = "Admin endpoints for viewing group members")
public class AdminMemberController {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private GroupRepository groupRepository;

    @GetMapping
    @Operation(summary = "List all group members with pagination and group info")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<BaseResponse<Page<AdminMemberResponse>>> listMembers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "joinedAt"));
        Page<Member> members = memberRepository.findAll(pageable);
        Page<AdminMemberResponse> responsePage = members.map(this::mapToResponse);
        return ResponseEntity.ok(new BaseResponse<>(true, responsePage, null));
    }

    private AdminMemberResponse mapToResponse(Member m) {
        AdminMemberResponse res = new AdminMemberResponse();
        res.setId(m.getId());
        res.setName(m.getName());
        res.setEmail(m.getEmail());
        res.setPhone(m.getPhone());
        res.setRole(m.getRole() != null ? m.getRole().name() : null);
        res.setStatus(m.getStatus() != null ? m.getStatus().name() : null);
        res.setJoinedAt(m.getJoinedAt());
        res.setLastActivity(m.getLastActivity());

        // Fetch group memberships for this member using targeted query
        List<GroupMember> memberships = groupMemberRepository.findByMemberId(m.getId());

        List<AdminMemberResponse.GroupInfo> groups = memberships.stream()
                .map(gm -> {
                    Optional<Group> groupOpt = groupRepository.findById(gm.getGroupId());
                    if (groupOpt.isEmpty()) return null;
                    Group g = groupOpt.get();
                    long memberCount = groupMemberRepository.countByGroupId(g.getId());
                    String ownerUsername = (g.getOwner() != null) ? g.getOwner().getUsername() : null;
                    return new AdminMemberResponse.GroupInfo(g.getId(), g.getName(), ownerUsername, memberCount);
                })
                .filter(gi -> gi != null)
                .collect(Collectors.toList());

        res.setGroups(groups);
        return res;
    }
}
