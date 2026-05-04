package com.hatirlat.backend.mapper;

import com.hatirlat.backend.dto.ContactRequest;
import com.hatirlat.backend.dto.CustomRepeatRequest;
import com.hatirlat.backend.dto.GroupResponse;
import com.hatirlat.backend.dto.ReminderResponse;
import com.hatirlat.backend.entity.Contact;
import com.hatirlat.backend.entity.CustomRepeatConfig;
import com.hatirlat.backend.entity.Group;
import com.hatirlat.backend.entity.Reminder;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.stream.Collectors;

@Component
public class ReminderMapper implements BaseMapper<Reminder, ReminderResponse> {

    @Override
    public ReminderResponse toDto(Reminder reminder) {
        if (reminder == null) {
            return null;
        }

        ReminderResponse response = new ReminderResponse();
        response.setId(String.valueOf(reminder.getId()));
        response.setTitle(reminder.getTitle());
        response.setType(reminder.getType() != null ? reminder.getType().name().toLowerCase(Locale.ENGLISH) : null);
        response.setMessage(reminder.getMessage());
        response.setDateTime(reminder.getDateTime());
        response.setStartDate(reminder.getStartDate());
        response.setEndDate(reminder.getEndDate());
        response.setStatus(
                reminder.getStatus() != null ? reminder.getStatus().name().toLowerCase(Locale.ENGLISH) : null);

        if (reminder.getChannels() != null) {
            response.setChannels(
                    reminder.getChannels().stream()
                            .map(Enum::name)
                            .map(name -> name.toLowerCase(Locale.ENGLISH))
                            .collect(Collectors.toList()));
        }
        response.setRepeat(
                reminder.getRepeat() != null ? reminder.getRepeat().name().toLowerCase(Locale.ENGLISH) : null);

        // Convert contact using proper JPA relationship
        if (reminder.getContact() != null) {
            ContactRequest contactRequest = new ContactRequest();
            contactRequest.setName(reminder.getContact().getName());
            contactRequest.setPhone(reminder.getContact().getPhone());
            contactRequest.setEmail(reminder.getContact().getEmail());
            response.setContact(contactRequest);
        }

        // Convert group using proper JPA relationship
        if (reminder.getGroup() != null) {
            GroupResponse groupResponse = new GroupResponse();
            groupResponse.setId(String.valueOf(reminder.getGroup().getId()));
            groupResponse.setName(reminder.getGroup().getName());
            groupResponse.setDescription(reminder.getGroup().getDescription());
            groupResponse.setCreatedAt(reminder.getGroup().getCreatedAt());
            response.setGroup(groupResponse);
        }

        // Convert custom repeat using proper JPA relationship
        if (reminder.getCustomRepeatConfig() != null) {
            CustomRepeatRequest customRepeatRequest = new CustomRepeatRequest();
            customRepeatRequest.setInterval(reminder.getCustomRepeatConfig().getInterval());
            customRepeatRequest.setFrequency(reminder.getCustomRepeatConfig().getFrequency() != null
                    ? reminder.getCustomRepeatConfig().getFrequency().name().toLowerCase(Locale.ENGLISH)
                    : null);
            if (reminder.getCustomRepeatConfig().getDaysOfWeek() != null) {
                customRepeatRequest.setDaysOfWeek(
                        reminder.getCustomRepeatConfig().getDaysOfWeek().stream()
                                .map(Enum::name)
                                .map(name -> name.toLowerCase(Locale.ENGLISH))
                                .collect(Collectors.toList()));
            }
            response.setCustomRepeat(customRepeatRequest);
        }

        return response;
    }

    @Override
    public Reminder toEntity(ReminderResponse dto) {
        if (dto == null) {
            return null;
        }

        Reminder reminder = new Reminder();
        if (dto.getId() != null) {
            reminder.setId(Long.valueOf(dto.getId()));
        }
        reminder.setTitle(dto.getTitle());
        reminder.setMessage(dto.getMessage());
        reminder.setDateTime(dto.getDateTime());

        // Convert enums with null safety
        if (dto.getType() != null) {
            try {
                reminder.setType(
                        com.hatirlat.backend.entity.ReminderType.valueOf(dto.getType().toUpperCase(Locale.ENGLISH)));
            } catch (IllegalArgumentException e) {
                // Handle invalid enum value gracefully
                reminder.setType(com.hatirlat.backend.entity.ReminderType.PERSONAL);
            }
        }

        if (dto.getStatus() != null) {
            try {
                reminder.setStatus(com.hatirlat.backend.entity.ReminderStatus
                        .valueOf(dto.getStatus().toUpperCase(Locale.ENGLISH)));
            } catch (IllegalArgumentException e) {
                // Handle invalid enum value gracefully
                reminder.setStatus(com.hatirlat.backend.entity.ReminderStatus.SCHEDULED);
            }
        }

        if (dto.getRepeat() != null) {
            try {
                reminder.setRepeat(
                        com.hatirlat.backend.entity.RepeatType.valueOf(dto.getRepeat().toUpperCase(Locale.ENGLISH)));
            } catch (IllegalArgumentException e) {
                // Handle invalid enum value gracefully
                reminder.setRepeat(com.hatirlat.backend.entity.RepeatType.NONE);
            }
        }

        return reminder;
    }
}