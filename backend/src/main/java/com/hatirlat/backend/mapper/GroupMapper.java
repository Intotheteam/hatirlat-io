package com.hatirlat.backend.mapper;

import com.hatirlat.backend.dto.GroupResponse;
import com.hatirlat.backend.entity.Group;
import com.hatirlat.backend.repository.MemberRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class GroupMapper implements BaseMapper<Group, GroupResponse> {

    private final MemberRepository memberRepository;

    public GroupMapper(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    @Override
    public GroupResponse toDto(Group group) {
        if (group == null) {
            return null;
        }

        GroupResponse response = new GroupResponse();
        response.setId(String.valueOf(group.getId()));
        response.setName(group.getName());
        response.setDescription(group.getDescription());
        
        // Count members by querying the MemberRepository
        List<com.hatirlat.backend.entity.Member> members = memberRepository.findMembersByGroupId(group.getId());
        response.setMemberCount(members != null ? members.size() : 0);
        response.setCreatedAt(group.getCreatedAt());
        response.setInviteCode(group.getInviteCode());

        return response;
    }

    @Override
    public Group toEntity(GroupResponse dto) {
        if (dto == null) {
            return null;
        }

        Group group = new Group();
        if (dto.getId() != null) {
            group.setId(Long.parseLong(dto.getId()));
        }
        group.setName(dto.getName());
        group.setDescription(dto.getDescription());
        group.setCreatedAt(dto.getCreatedAt());

        return group;
    }
}