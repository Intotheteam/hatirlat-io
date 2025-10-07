package com.hatirlat.backend.service;

import com.hatirlat.backend.dto.*;
import com.hatirlat.backend.entity.*;
import com.hatirlat.backend.repository.ReminderRepository;
import com.hatirlat.backend.repository.GroupRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReminderService {

    private static final Logger log = LoggerFactory.getLogger(ReminderService.class);

    @Autowired
    private ReminderRepository reminderRepository;
    
    @Autowired
    private GroupRepository groupRepository;

    @Transactional(readOnly = true)
    public List<ReminderResponse> getAllReminders() {
        // In a real implementation, you'd filter by the authenticated user
        List<Reminder> reminders = reminderRepository.findAll();
        return reminders.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReminderResponse getReminderById(String id) {
        // Find by ID and convert to response
        return reminderRepository.findById(Long.parseLong(id))
                .map(this::convertToResponse)
                .orElse(null);
    }

    @Transactional
    public ReminderResponse createReminder(ReminderRequest request) {
        Reminder reminder = new Reminder();
        reminder.setTitle(request.getTitle());
        
        // Safely parse enums with error handling
        reminder.setType(parseEnumSafely(request.getType(), ReminderType.class, ReminderType.PERSONAL));
        reminder.setMessage(request.getMessage());
        reminder.setDateTime(request.getDateTime());
        reminder.setStatus(parseEnumSafely(request.getStatus(), ReminderStatus.class, ReminderStatus.SCHEDULED));
        reminder.setChannels(convertChannelStringsToEnums(request.getChannels()));
        reminder.setRepeat(parseEnumSafely(request.getRepeat(), RepeatType.class, RepeatType.NONE));

        // Set contact if provided
        if (request.getContact() != null) {
            Contact contact = new Contact();
            contact.setName(request.getContact().getName());
            contact.setPhone(request.getContact().getPhone());
            contact.setEmail(request.getContact().getEmail());
            // In a real implementation, you'd save or find the contact
            reminder.setContact(contact);
        }

        // Set group if provided by ID
        if (request.getGroupId() != null) {
            try {
                Long groupId = Long.parseLong(request.getGroupId());
                Group group = groupRepository.findById(groupId).orElse(null);
                if (group != null) {
                    reminder.setGroup(group);
                }
            } catch (NumberFormatException e) {
                // Handle invalid group ID gracefully - log error and continue without group
                log.warn("Invalid group ID: {}", request.getGroupId());
            }
        }

        // Set custom repeat if provided and repeat type is "custom"
        if (RepeatType.CUSTOM.equals(reminder.getRepeat()) && request.getCustomRepeat() != null) {
            CustomRepeatConfig customRepeat = new CustomRepeatConfig();
            customRepeat.setInterval(request.getCustomRepeat().getInterval());
            if (request.getCustomRepeat().getFrequency() != null) {
                customRepeat.setFrequency(parseEnumSafely(request.getCustomRepeat().getFrequency(), RepeatFrequency.class, RepeatFrequency.DAY));
            }
            if (request.getCustomRepeat().getDaysOfWeek() != null) {
                customRepeat.setDaysOfWeek(
                    request.getCustomRepeat().getDaysOfWeek().stream()
                        .map(day -> parseEnumSafely(day, DayOfWeek.class, DayOfWeek.MON))
                        .collect(Collectors.toList())
                );
            }
            reminder.setCustomRepeat(customRepeat);
        }

        Reminder savedReminder = reminderRepository.save(reminder);
        return convertToResponse(savedReminder);
    }

    @Transactional
    public ReminderResponse updateReminder(String id, ReminderRequest request) {
        Reminder existingReminder = reminderRepository.findById(Long.parseLong(id)).orElse(null);
        if (existingReminder == null) {
            return null;
        }

        existingReminder.setTitle(request.getTitle());
        existingReminder.setType(parseEnumSafely(request.getType(), ReminderType.class, existingReminder.getType()));
        existingReminder.setMessage(request.getMessage());
        existingReminder.setDateTime(request.getDateTime());
        existingReminder.setStatus(parseEnumSafely(request.getStatus(), ReminderStatus.class, existingReminder.getStatus()));
        existingReminder.setChannels(convertChannelStringsToEnums(request.getChannels()));
        existingReminder.setRepeat(parseEnumSafely(request.getRepeat(), RepeatType.class, existingReminder.getRepeat()));

        // Update contact if provided
        if (request.getContact() != null) {
            Contact contact = new Contact();
            contact.setName(request.getContact().getName());
            contact.setPhone(request.getContact().getPhone());
            contact.setEmail(request.getContact().getEmail());
            // In a real implementation, you'd save or find the contact
            existingReminder.setContact(contact);
        }

        // Update group if provided by ID
        if (request.getGroupId() != null) {
            try {
                Long groupId = Long.parseLong(request.getGroupId());
                Group group = groupRepository.findById(groupId).orElse(null);
                if (group != null) {
                    existingReminder.setGroup(group);
                } else {
                    // If group is not found, set to null to avoid association with non-existent group
                    existingReminder.setGroup(null);
                }
            } catch (NumberFormatException e) {
                // Handle invalid group ID gracefully - set group to null
                existingReminder.setGroup(null);
                log.warn("Invalid group ID: {}", request.getGroupId());
            }
        }

        // Update custom repeat if provided and repeat type is "custom"
        if (RepeatType.CUSTOM.equals(existingReminder.getRepeat()) && request.getCustomRepeat() != null) {
            CustomRepeatConfig customRepeat = new CustomRepeatConfig();
            customRepeat.setInterval(request.getCustomRepeat().getInterval());
            if (request.getCustomRepeat().getFrequency() != null) {
                customRepeat.setFrequency(parseEnumSafely(request.getCustomRepeat().getFrequency(), RepeatFrequency.class, RepeatFrequency.DAY));
            }
            if (request.getCustomRepeat().getDaysOfWeek() != null) {
                customRepeat.setDaysOfWeek(
                    request.getCustomRepeat().getDaysOfWeek().stream()
                        .map(day -> parseEnumSafely(day, DayOfWeek.class, DayOfWeek.MON))
                        .collect(Collectors.toList())
                );
            }
            existingReminder.setCustomRepeat(customRepeat);
        } else {
            existingReminder.setCustomRepeat(null);
        }

        Reminder updatedReminder = reminderRepository.save(existingReminder);
        return convertToResponse(updatedReminder);
    }

    @Transactional
    public ReminderResponse updateReminderStatus(String id, String status) {
        Reminder reminder = reminderRepository.findById(Long.parseLong(id)).orElse(null);
        if (reminder == null) {
            return null;
        }

        ReminderStatus newStatus = parseEnumSafely(status, ReminderStatus.class, ReminderStatus.SCHEDULED);
        reminder.setStatus(newStatus);
        Reminder updatedReminder = reminderRepository.save(reminder);
        return convertToResponse(updatedReminder);
    }

    @Transactional
    public boolean deleteReminder(String id) {
        if (reminderRepository.existsById(Long.parseLong(id))) {
            reminderRepository.deleteById(Long.parseLong(id));
            return true;
        }
        return false;
    }

    private <T extends Enum<T>> T parseEnumSafely(String value, Class<T> enumClass, T defaultValue) {
        if (value == null || value.trim().isEmpty()) {
            return defaultValue;
        }
        try {
            return Enum.valueOf(enumClass, value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            log.debug("Invalid enum value '{}' for {}, using default: {}", value, enumClass.getSimpleName(), defaultValue);
            return defaultValue;
        }
    }

    private List<NotificationChannel> convertChannelStringsToEnums(List<String> channelStrings) {
        if (channelStrings == null) return null;
        return channelStrings.stream()
                .map(channel -> parseEnumSafely(channel, NotificationChannel.class, null))
                .filter(java.util.Objects::nonNull) // Filter out any invalid enum values
                .collect(Collectors.toList());
    }

    private ReminderResponse convertToResponse(Reminder reminder) {
        ReminderResponse response = new ReminderResponse();
        response.setId(String.valueOf(reminder.getId()));
        response.setTitle(reminder.getTitle());
        response.setType(reminder.getType() != null ? reminder.getType().name().toLowerCase() : null);
        response.setMessage(reminder.getMessage());
        response.setDateTime(reminder.getDateTime());
        response.setStatus(reminder.getStatus() != null ? reminder.getStatus().name().toLowerCase() : null);
        if (reminder.getChannels() != null) {
            response.setChannels(
                reminder.getChannels().stream()
                    .map(Enum::name)
                    .map(String::toLowerCase)
                    .collect(Collectors.toList())
            );
        }
        response.setRepeat(reminder.getRepeat() != null ? reminder.getRepeat().name().toLowerCase() : null);

        // Convert contact
        if (reminder.getContact() != null) {
            ContactRequest contactRequest = new ContactRequest();
            contactRequest.setName(reminder.getContact().getName());
            contactRequest.setPhone(reminder.getContact().getPhone());
            contactRequest.setEmail(reminder.getContact().getEmail());
            response.setContact(contactRequest);
        }

        // Convert group
        if (reminder.getGroup() != null) {
            GroupResponse groupResponse = new GroupResponse();
            groupResponse.setId(String.valueOf(reminder.getGroup().getId()));
            groupResponse.setName(reminder.getGroup().getName());
            groupResponse.setDescription(reminder.getGroup().getDescription());
            groupResponse.setMemberCount(reminder.getGroup().getMembers() != null ? 
                reminder.getGroup().getMembers().size() : 0);
            groupResponse.setCreatedAt(reminder.getGroup().getCreatedAt());
            response.setGroup(groupResponse);
        }

        // Convert custom repeat
        if (reminder.getCustomRepeat() != null) {
            CustomRepeatRequest customRepeatRequest = new CustomRepeatRequest();
            customRepeatRequest.setInterval(reminder.getCustomRepeat().getInterval());
            customRepeatRequest.setFrequency(reminder.getCustomRepeat().getFrequency() != null ? 
                reminder.getCustomRepeat().getFrequency().name().toLowerCase() : null);
            if (reminder.getCustomRepeat().getDaysOfWeek() != null) {
                customRepeatRequest.setDaysOfWeek(
                    reminder.getCustomRepeat().getDaysOfWeek().stream()
                        .map(Enum::name)
                        .map(String::toLowerCase)
                        .collect(Collectors.toList())
                );
            }
            response.setCustomRepeat(customRepeatRequest);
        }

        return response;
    }
}