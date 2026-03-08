package com.hatirlat.backend.service;

import com.hatirlat.backend.dto.NotificationLogResponse;
import com.hatirlat.backend.entity.NotificationLog;
import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.repository.NotificationLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationLogService {

    private final NotificationLogRepository notificationLogRepository;

    public NotificationLogService(NotificationLogRepository notificationLogRepository) {
        this.notificationLogRepository = notificationLogRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationLogResponse> getNotificationLogs(User user, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationLog> logs = notificationLogRepository.findByUserOrderBySentAtDesc(user, pageable);
        return logs.getContent().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getTotalCount(User user) {
        return notificationLogRepository.findByUserOrderBySentAtDesc(user).size();
    }

    @Transactional(readOnly = true)
    public List<NotificationLogResponse> getNotificationLogsByReminder(Long reminderId, User user, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationLog> logs = notificationLogRepository.findByReminderIdAndUserOrderBySentAtDesc(reminderId,
                user, pageable);
        return logs.getContent().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getTotalCountByReminder(Long reminderId, User user) {
        Pageable pageable = Pageable.unpaged();
        return notificationLogRepository.findByReminderIdAndUserOrderBySentAtDesc(reminderId, user, pageable)
                .getTotalElements();
    }

    private NotificationLogResponse toDto(NotificationLog log) {
        NotificationLogResponse dto = new NotificationLogResponse();
        dto.setId(String.valueOf(log.getId()));
        if (log.getReminder() != null) {
            dto.setReminderId(String.valueOf(log.getReminder().getId()));
            dto.setReminderTitle(log.getReminder().getTitle());
        }
        dto.setChannel(log.getChannel() != null ? log.getChannel().name() : null);
        dto.setRecipient(log.getRecipient());
        dto.setStatus(log.getStatus() != null ? log.getStatus().name() : null);
        dto.setErrorMessage(log.getErrorMessage());
        dto.setProviderMessageId(log.getProviderMessageId());
        dto.setProviderStatus(log.getProviderStatus());
        dto.setProviderErrorCode(log.getProviderErrorCode());
        dto.setProviderResponse(log.getProviderResponse());
        dto.setSentAt(log.getSentAt());
        return dto;
    }
}
