package com.hatirlat.backend.service;

import com.hatirlat.backend.dto.*;
import com.hatirlat.backend.entity.*;
import com.hatirlat.backend.exception.ResourceNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import com.hatirlat.backend.mapper.ContactMapper;
import com.hatirlat.backend.mapper.ReminderMapper;
import com.hatirlat.backend.repository.ContactRepository;
import com.hatirlat.backend.repository.CustomRepeatConfigRepository;
import com.hatirlat.backend.repository.GroupRepository;
import com.hatirlat.backend.repository.MemberRepository;
import com.hatirlat.backend.repository.ReminderRepository;
import com.hatirlat.backend.util.LoggingUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Locale;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReminderService {

    private static final Logger logger = LoggerFactory.getLogger(ReminderService.class);

    private final ReminderRepository reminderRepository;
    private final GroupRepository groupRepository;
    private final MemberRepository memberRepository;
    private final ContactRepository contactRepository;
    private final CustomRepeatConfigRepository customRepeatConfigRepository;
    private final ReminderMapper reminderMapper;
    private final ContactMapper contactMapper;
    private final LoggingUtil loggingUtil;
    private final PlanLimitService planLimitService;

    public ReminderService(ReminderRepository reminderRepository,
            GroupRepository groupRepository,
            MemberRepository memberRepository,
            ContactRepository contactRepository,
            CustomRepeatConfigRepository customRepeatConfigRepository,
            ReminderMapper reminderMapper,
            ContactMapper contactMapper,
            LoggingUtil loggingUtil,
            PlanLimitService planLimitService) {
        this.reminderRepository = reminderRepository;
        this.groupRepository = groupRepository;
        this.memberRepository = memberRepository;
        this.contactRepository = contactRepository;
        this.customRepeatConfigRepository = customRepeatConfigRepository;
        this.reminderMapper = reminderMapper;
        this.contactMapper = contactMapper;
        this.loggingUtil = loggingUtil;
        this.planLimitService = planLimitService;
    }

    @Transactional(readOnly = true)
    public List<ReminderResponse> getAllReminders(User currentUser) {
        loggingUtil.logServiceMethodEntry(this.getClass().getSimpleName(), "getAllReminders");
        try {
            List<Reminder> reminders = reminderRepository.findByUser(currentUser);
            List<ReminderResponse> responses = reminders.stream().map(reminderMapper::toDto)
                    .collect(Collectors.toList());
            loggingUtil.logServiceMethodExit(this.getClass().getSimpleName(), "getAllReminders",
                    responses.size() + " reminders retrieved");
            return responses;
        } catch (Exception e) {
            loggingUtil.logServiceMethodError(this.getClass().getSimpleName(), "getAllReminders", e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<ReminderResponse> searchReminders(String query, User currentUser) {
        loggingUtil.logServiceMethodEntry(this.getClass().getSimpleName(), "searchReminders", query);
        try {
            List<Reminder> reminders = reminderRepository.searchByUserAndTitleOrMessage(currentUser, query);
            List<ReminderResponse> responses = reminders.stream().map(reminderMapper::toDto)
                    .collect(Collectors.toList());
            loggingUtil.logServiceMethodExit(this.getClass().getSimpleName(), "searchReminders",
                    responses.size() + " reminders found");
            return responses;
        } catch (Exception e) {
            loggingUtil.logServiceMethodError(this.getClass().getSimpleName(), "searchReminders", e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<ReminderResponse> getAllRemindersPaged(User currentUser, int page, int size) {
        loggingUtil.logServiceMethodEntry(this.getClass().getSimpleName(), "getAllRemindersPaged");
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dateTime"));
            Page<Reminder> reminderPage = reminderRepository.findByUser(currentUser, pageable);
            List<ReminderResponse> responses = reminderPage.getContent().stream()
                    .map(reminderMapper::toDto).collect(Collectors.toList());
            return new PageResponse<>(responses, page, size, reminderPage.getTotalElements(),
                    reminderPage.getTotalPages());
        } catch (Exception e) {
            loggingUtil.logServiceMethodError(this.getClass().getSimpleName(), "getAllRemindersPaged", e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<ReminderResponse> searchRemindersPaged(String query, User currentUser, int page, int size) {
        loggingUtil.logServiceMethodEntry(this.getClass().getSimpleName(), "searchRemindersPaged", query);
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dateTime"));
            Page<Reminder> reminderPage = reminderRepository.searchByUserAndTitleOrMessage(currentUser, query,
                    pageable);
            List<ReminderResponse> responses = reminderPage.getContent().stream()
                    .map(reminderMapper::toDto).collect(Collectors.toList());
            return new PageResponse<>(responses, page, size, reminderPage.getTotalElements(),
                    reminderPage.getTotalPages());
        } catch (Exception e) {
            loggingUtil.logServiceMethodError(this.getClass().getSimpleName(), "searchRemindersPaged", e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public ReminderResponse getReminderById(String id, User currentUser) {
        loggingUtil.logServiceMethodEntry(this.getClass().getSimpleName(), "getReminderById", id);
        try {
            Reminder reminder = reminderRepository.findById(Long.parseLong(id))
                    .orElseThrow(() -> new ResourceNotFoundException("Reminder", id));
            verifyOwnership(reminder, currentUser);
            ReminderResponse response = reminderMapper.toDto(reminder);
            loggingUtil.logServiceMethodExit(this.getClass().getSimpleName(), "getReminderById", id);
            return response;
        } catch (Exception e) {
            loggingUtil.logServiceMethodError(this.getClass().getSimpleName(), "getReminderById", e);
            throw e;
        }
    }

    /** Fetch the underlying entity (with ownership check) for non-DTO consumers like the .ics export. */
    @Transactional(readOnly = true)
    public Reminder getReminderEntity(String id, User currentUser) {
        Reminder reminder = reminderRepository.findById(Long.parseLong(id))
                .orElseThrow(() -> new ResourceNotFoundException("Reminder", id));
        verifyOwnership(reminder, currentUser);
        return reminder;
    }

    @Transactional
    public ReminderResponse createReminder(ReminderRequest request, User currentUser) {
        loggingUtil.logServiceMethodEntry(this.getClass().getSimpleName(), "createReminder", request.getTitle());
        try {
            // Create the reminder entity with basic data
            Reminder reminder = new Reminder();
            reminder.setUser(currentUser);
            reminder.setTitle(request.getTitle());
            reminder.setType(parseEnumSafely(request.getType(), ReminderType.class, ReminderType.PERSONAL));
            reminder.setMessage(request.getMessage());
            reminder.setDateTime(request.getDateTime());
            // startDate defaults to dateTime if not provided (first fire time = original start)
            reminder.setStartDate(request.getStartDate() != null ? request.getStartDate() : request.getDateTime());
            reminder.setEndDate(request.getEndDate());
            reminder.setStatus(parseEnumSafely(request.getStatus(), ReminderStatus.class, ReminderStatus.SCHEDULED));
            reminder.setChannels(convertChannelStringsToEnums(request.getChannels()));
            reminder.setRepeat(parseEnumSafely(request.getRepeat(), RepeatType.class, RepeatType.NONE));

            // ── Tier-based Limits ──────────────────────────────────────────────────────
            boolean isPremium = currentUser.isPremium();
            boolean hourlyAllowed = isPremium
                    ? planLimitService.premiumHourlyAllowed()
                    : planLimitService.freeHourlyAllowed();

            // 1. Block HOURLY repeat if not allowed for this tier
            if (!hourlyAllowed && RepeatType.HOURLY.equals(reminder.getRepeat())) {
                throw new IllegalArgumentException(
                        "Saatlik hatırlatma yalnızca Premium kullanıcılara açıktır. Minimum tekrar sıklığı: günlük.");
            }

            // 2. Group reminder count cap
            if (ReminderType.GROUP.equals(reminder.getType())) {
                int maxGroupReminders = isPremium
                        ? planLimitService.premiumMaxGroupReminders()
                        : planLimitService.freeMaxGroupReminders();
                if (maxGroupReminders >= 0) { // -1 means unlimited
                    long groupReminderCount = reminderRepository.countByUserAndType(currentUser, ReminderType.GROUP);
                    if (groupReminderCount >= maxGroupReminders) {
                        throw new IllegalArgumentException(
                                String.format("Ücretsiz kullanıcılar en fazla %d grup hatırlatıcısı oluşturabilir.",
                                        maxGroupReminders));
                    }
                }
            }
            // ──────────────────────────────────────────────────────────────────────────

            // Set contact if provided
            if (request.getContact() != null) {
                Contact contact = contactMapper.toEntity(request.getContact());
                contact = contactRepository.save(contact);
                reminder.setContact(contact);
                logger.debug("Contact created with ID: {}", contact.getId());
            }

            // Set group if provided by ID
            if (request.getGroupId() != null) {
                try {
                    Long groupId = Long.parseLong(request.getGroupId());
                    Group group = groupRepository.findById(groupId)
                            .orElseThrow(() -> new ResourceNotFoundException("Group", request.getGroupId()));
                    reminder.setGroup(group);
                    logger.debug("Group associated with reminder: {}", groupId);
                } catch (NumberFormatException e) {
                    logger.error("Invalid group ID format: {}", request.getGroupId());
                    throw new IllegalArgumentException("Invalid group ID format: " + request.getGroupId());
                }
            }

            // Set custom repeat config if provided and repeat type is "custom"
            if (RepeatType.CUSTOM.equals(reminder.getRepeat()) && request.getCustomRepeat() != null) {
                CustomRepeatConfig customRepeat = createCustomRepeatConfig(request.getCustomRepeat());
                customRepeat = customRepeatConfigRepository.save(customRepeat);
                reminder.setCustomRepeatConfig(customRepeat);
                logger.debug("Custom repeat configuration created with ID: {}", customRepeat.getId());
            }

            Reminder savedReminder = reminderRepository.save(reminder);
            loggingUtil.logDatabaseOperation("CREATE", "Reminder", savedReminder.getId());
            ReminderResponse response = reminderMapper.toDto(savedReminder);
            loggingUtil.logServiceMethodExit(this.getClass().getSimpleName(), "createReminder", response.getId());
            return response;
        } catch (Exception e) {
            loggingUtil.logServiceMethodError(this.getClass().getSimpleName(), "createReminder", e);
            throw e;
        }
    }

    @Transactional
    public ReminderResponse updateReminder(String id, ReminderRequest request, User currentUser) {
        loggingUtil.logServiceMethodEntry(this.getClass().getSimpleName(), "updateReminder", id);
        try {
            Reminder existingReminder = reminderRepository.findById(Long.parseLong(id))
                    .orElseThrow(() -> new ResourceNotFoundException("Reminder", id));
            verifyOwnership(existingReminder, currentUser);

            existingReminder.setTitle(request.getTitle());
            existingReminder
                    .setType(parseEnumSafely(request.getType(), ReminderType.class, existingReminder.getType()));
            existingReminder.setMessage(request.getMessage());
            existingReminder.setDateTime(request.getDateTime());
            if (request.getStartDate() != null) {
                existingReminder.setStartDate(request.getStartDate());
            } else if (existingReminder.getStartDate() == null) {
                existingReminder.setStartDate(request.getDateTime());
            }
            existingReminder.setEndDate(request.getEndDate());

            ReminderStatus newStatus = parseEnumSafely(request.getStatus(), ReminderStatus.class,
                    existingReminder.getStatus());

            // Auto-reset FAILED -> SCHEDULED if the dateTime is updated to the future
            if (existingReminder.getStatus() == ReminderStatus.FAILED && newStatus == ReminderStatus.FAILED) {
                if (request.getDateTime() != null && request.getDateTime().isAfter(java.time.LocalDateTime.now())) {
                    newStatus = ReminderStatus.SCHEDULED;
                }
            }
            existingReminder.setStatus(newStatus);

            existingReminder.setChannels(convertChannelStringsToEnums(request.getChannels()));
            RepeatType newRepeat = parseEnumSafely(request.getRepeat(), RepeatType.class, existingReminder.getRepeat());

            // Tier-based hourly check on update
            boolean isPremiumOnUpdate = currentUser.isPremium();
            boolean hourlyAllowedOnUpdate = isPremiumOnUpdate
                    ? planLimitService.premiumHourlyAllowed()
                    : planLimitService.freeHourlyAllowed();
            if (!hourlyAllowedOnUpdate && RepeatType.HOURLY.equals(newRepeat)) {
                throw new IllegalArgumentException(
                        "Saatlik hatırlatma yalnızca Premium kullanıcılara açıktır.");
            }
            existingReminder.setRepeat(newRepeat);

            // Update contact if provided
            if (request.getContact() != null) {
                Contact contact = contactMapper.toEntity(request.getContact());
                contact = contactRepository.save(contact);
                existingReminder.setContact(contact);
                logger.debug("Contact updated with ID: {}", contact.getId());
            }

            // Update group if provided by ID
            if (request.getGroupId() != null) {
                try {
                    Long groupId = Long.parseLong(request.getGroupId());
                    Group group = groupRepository.findById(groupId)
                            .orElseThrow(() -> new ResourceNotFoundException("Group", request.getGroupId()));
                    existingReminder.setGroup(group);
                    logger.debug("Group updated for reminder: {}", groupId);
                } catch (NumberFormatException e) {
                    logger.error("Invalid group ID format: {}", request.getGroupId());
                    throw new IllegalArgumentException("Invalid group ID format: " + request.getGroupId());
                }
            }

            // Update custom repeat if provided and repeat type is "custom"
            if (RepeatType.CUSTOM.equals(existingReminder.getRepeat()) && request.getCustomRepeat() != null) {
                CustomRepeatConfig customRepeat = createCustomRepeatConfig(request.getCustomRepeat());
                customRepeat = customRepeatConfigRepository.save(customRepeat);
                existingReminder.setCustomRepeatConfig(customRepeat);
                logger.debug("Custom repeat configuration updated with ID: {}", customRepeat.getId());
            } else {
                existingReminder.setCustomRepeatConfig(null);
                logger.debug("Custom repeat configuration removed for reminder: {}", id);
            }

            Reminder updatedReminder = reminderRepository.save(existingReminder);
            loggingUtil.logDatabaseOperation("UPDATE", "Reminder", updatedReminder.getId());
            ReminderResponse response = reminderMapper.toDto(updatedReminder);
            loggingUtil.logServiceMethodExit(this.getClass().getSimpleName(), "updateReminder", response.getId());
            return response;
        } catch (Exception e) {
            loggingUtil.logServiceMethodError(this.getClass().getSimpleName(), "updateReminder", e);
            throw e;
        }
    }

    @Transactional
    public ReminderResponse updateReminderStatus(String id, String status, User currentUser) {
        loggingUtil.logServiceMethodEntry(this.getClass().getSimpleName(), "updateReminderStatus", id, status);
        try {
            Reminder reminder = reminderRepository.findById(Long.parseLong(id))
                    .orElseThrow(() -> new ResourceNotFoundException("Reminder", id));
            verifyOwnership(reminder, currentUser);

            ReminderStatus newStatus = parseEnumSafely(status, ReminderStatus.class, ReminderStatus.SCHEDULED);
            reminder.setStatus(newStatus);
            Reminder updatedReminder = reminderRepository.save(reminder);
            loggingUtil.logDatabaseOperation("UPDATE", "Reminder", updatedReminder.getId());
            ReminderResponse response = reminderMapper.toDto(updatedReminder);
            loggingUtil.logServiceMethodExit(this.getClass().getSimpleName(), "updateReminderStatus", response.getId());
            return response;
        } catch (Exception e) {
            loggingUtil.logServiceMethodError(this.getClass().getSimpleName(), "updateReminderStatus", e);
            throw e;
        }
    }

    @Transactional
    public boolean deleteReminder(String id, User currentUser) {
        loggingUtil.logServiceMethodEntry(this.getClass().getSimpleName(), "deleteReminder", id);
        try {
            Reminder reminder = reminderRepository.findById(Long.parseLong(id))
                    .orElseThrow(() -> new ResourceNotFoundException("Reminder", id));
            verifyOwnership(reminder, currentUser);
            reminderRepository.deleteById(Long.parseLong(id));
            loggingUtil.logDatabaseOperation("DELETE", "Reminder", id);
            loggingUtil.logServiceMethodExit(this.getClass().getSimpleName(), "deleteReminder", true);
            return true;
        } catch (Exception e) {
            loggingUtil.logServiceMethodError(this.getClass().getSimpleName(), "deleteReminder", e);
            throw e;
        }
    }

    private void verifyOwnership(Reminder reminder, User currentUser) {
        if (reminder.getUser() != null && !reminder.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not have permission to access this reminder");
        }
    }

    private CustomRepeatConfig createCustomRepeatConfig(
            com.hatirlat.backend.dto.CustomRepeatRequest customRepeatRequest) {
        CustomRepeatConfig customRepeat = new CustomRepeatConfig();
        customRepeat.setInterval(customRepeatRequest.getInterval());
        if (customRepeatRequest.getFrequency() != null) {
            customRepeat.setFrequency(
                    parseEnumSafely(customRepeatRequest.getFrequency(), RepeatFrequency.class, RepeatFrequency.DAY));
        }
        if (customRepeatRequest.getDaysOfWeek() != null) {
            customRepeat.setDaysOfWeek(
                    customRepeatRequest.getDaysOfWeek().stream()
                            .map(day -> parseEnumSafely(day, DayOfWeek.class, DayOfWeek.MON))
                            .collect(Collectors.toList()));
        }
        return customRepeat;
    }

    private <T extends Enum<T>> T parseEnumSafely(String value, Class<T> enumClass, T defaultValue) {
        if (value == null || value.trim().isEmpty()) {
            return defaultValue;
        }
        try {
            return Enum.valueOf(enumClass, value.toUpperCase(Locale.ENGLISH).trim());
        } catch (IllegalArgumentException e) {
            logger.debug("Invalid enum value '{}' for {}, using default: {}", value, enumClass.getSimpleName(),
                    defaultValue);
            return defaultValue;
        }
    }

    private List<NotificationChannel> convertChannelStringsToEnums(List<String> channelStrings) {
        if (channelStrings == null)
            return null;
        return channelStrings.stream()
                .map(channel -> parseEnumSafely(channel, NotificationChannel.class, null))
                .filter(java.util.Objects::nonNull) // Filter out any invalid enum values
                .collect(Collectors.toList());
    }
}