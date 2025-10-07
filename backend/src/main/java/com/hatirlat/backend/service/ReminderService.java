package com.hatirlat.backend.service;

import com.hatirlat.backend.dto.*;
import com.hatirlat.backend.entity.*;
import com.hatirlat.backend.exception.ResourceNotFoundException;
import com.hatirlat.backend.repository.ContactRepository;
import com.hatirlat.backend.repository.CustomRepeatConfigRepository;
import com.hatirlat.backend.repository.GroupRepository;
import com.hatirlat.backend.repository.MemberRepository;
import com.hatirlat.backend.repository.ReminderRepository;
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
    
    @Autowired
    private MemberRepository memberRepository;
    
    @Autowired
    private ContactRepository contactRepository;
    
    @Autowired
    private CustomRepeatConfigRepository customRepeatConfigRepository;

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
                .orElseThrow(() -> new ResourceNotFoundException("Reminder", id));
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

        // Set contact ID if provided
        if (request.getContact() != null) {
            Contact contact = new Contact();
            contact.setName(request.getContact().getName());
            contact.setPhone(request.getContact().getPhone());
            contact.setEmail(request.getContact().getEmail());
            Contact savedContact = contactRepository.save(contact);
            reminder.setContactId(savedContact.getId()); // Set the foreign key ID
        }

        // Set group ID if provided
        if (request.getGroupId() != null) {
            try {
                Long groupId = Long.parseLong(request.getGroupId());
                // Verify group exists
                if (groupRepository.existsById(groupId)) {
                    reminder.setGroupId(groupId); // Set the foreign key ID
                } else {
                    log.warn("Group not found with ID: {}", groupId);
                }
            } catch (NumberFormatException e) {
                // Handle invalid group ID gracefully - log error and continue without group
                log.warn("Invalid group ID: {}", request.getGroupId());
            }
        }

        // Set custom repeat ID if provided and repeat type is "custom"
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
            CustomRepeatConfig savedCustomRepeat = customRepeatConfigRepository.save(customRepeat);
            reminder.setCustomRepeatId(savedCustomRepeat.getId()); // Set the foreign key ID
        }

        Reminder savedReminder = reminderRepository.save(reminder);
        return convertToResponse(savedReminder);
    }

    @Transactional
    public ReminderResponse updateReminder(String id, ReminderRequest request) {
        Reminder existingReminder = reminderRepository.findById(Long.parseLong(id))
            .orElseThrow(() -> new ResourceNotFoundException("Reminder", id));

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
            Contact savedContact = contactRepository.save(contact);
            existingReminder.setContactId(savedContact.getId()); // Set the foreign key ID
        }

        // Update group if provided by ID
        if (request.getGroupId() != null) {
            try {
                Long groupId = Long.parseLong(request.getGroupId());
                // Verify group exists
                if (groupRepository.existsById(groupId)) {
                    existingReminder.setGroupId(groupId); // Set the foreign key ID
                } else {
                    throw new ResourceNotFoundException("Group", request.getGroupId());
                }
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Invalid group ID format: " + request.getGroupId());
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
            CustomRepeatConfig savedCustomRepeat = customRepeatConfigRepository.save(customRepeat);
            existingReminder.setCustomRepeatId(savedCustomRepeat.getId()); // Set the foreign key ID
        } else {
            existingReminder.setCustomRepeatId(null);
        }

        Reminder updatedReminder = reminderRepository.save(existingReminder);
        return convertToResponse(updatedReminder);
    }

    @Transactional
    public ReminderResponse updateReminderStatus(String id, String status) {
        Reminder reminder = reminderRepository.findById(Long.parseLong(id))
            .orElseThrow(() -> new ResourceNotFoundException("Reminder", id));

        ReminderStatus newStatus = parseEnumSafely(status, ReminderStatus.class, ReminderStatus.SCHEDULED);
        reminder.setStatus(newStatus);
        Reminder updatedReminder = reminderRepository.save(reminder);
        return convertToResponse(updatedReminder);
    }

    @Transactional
    public boolean deleteReminder(String id) {
        if (!reminderRepository.existsById(Long.parseLong(id))) {
            throw new ResourceNotFoundException("Reminder", id);
        }
        reminderRepository.deleteById(Long.parseLong(id));
        return true;
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

        // Convert contact using contact ID
        if (reminder.getContactId() != null) {
            Contact contact = contactRepository.findById(reminder.getContactId()).orElse(null);
            if (contact != null) {
                ContactRequest contactRequest = new ContactRequest();
                contactRequest.setName(contact.getName());
                contactRequest.setPhone(contact.getPhone());
                contactRequest.setEmail(contact.getEmail());
                response.setContact(contactRequest);
            }
        }

        // Convert group using group ID
        if (reminder.getGroupId() != null) {
            Group group = groupRepository.findById(reminder.getGroupId()).orElse(null);
            if (group != null) {
                GroupResponse groupResponse = new GroupResponse();
                groupResponse.setId(String.valueOf(group.getId()));
                groupResponse.setName(group.getName());
                groupResponse.setDescription(group.getDescription());
                // Count members by querying the GroupMember repository
                List<Member> members = memberRepository.findMembersByGroupId(group.getId());
                groupResponse.setMemberCount(members != null ? members.size() : 0);
                groupResponse.setCreatedAt(group.getCreatedAt());
                response.setGroup(groupResponse);
            }
        }

        // Convert custom repeat using custom repeat ID
        if (reminder.getCustomRepeatId() != null) {
            CustomRepeatConfig customRepeat = customRepeatConfigRepository.findById(reminder.getCustomRepeatId()).orElse(null);
            if (customRepeat != null) {
                CustomRepeatRequest customRepeatRequest = new CustomRepeatRequest();
                customRepeatRequest.setInterval(customRepeat.getInterval());
                customRepeatRequest.setFrequency(customRepeat.getFrequency() != null ? 
                    customRepeat.getFrequency().name().toLowerCase() : null);
                if (customRepeat.getDaysOfWeek() != null) {
                    customRepeatRequest.setDaysOfWeek(
                        customRepeat.getDaysOfWeek().stream()
                            .map(Enum::name)
                            .map(String::toLowerCase)
                            .collect(Collectors.toList())
                    );
                }
                response.setCustomRepeat(customRepeatRequest);
            }
        }

        return response;
    }
}