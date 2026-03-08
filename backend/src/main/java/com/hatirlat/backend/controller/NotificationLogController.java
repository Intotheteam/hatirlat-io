package com.hatirlat.backend.controller;

import com.hatirlat.backend.dto.BaseResponse;
import com.hatirlat.backend.dto.NotificationLogResponse;
import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.service.NotificationLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notification-logs")
@Tag(name = "Notification Logs", description = "Notification history endpoints")
public class NotificationLogController {

    private final NotificationLogService notificationLogService;

    public NotificationLogController(NotificationLogService notificationLogService) {
        this.notificationLogService = notificationLogService;
    }

    @Operation(summary = "Get notification logs", description = "Retrieve notification history for the authenticated user")
    @GetMapping
    public ResponseEntity<BaseResponse<List<NotificationLogResponse>>> getNotificationLogs(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<NotificationLogResponse> logs = notificationLogService.getNotificationLogs(currentUser, page, size);
        String message = logs.isEmpty()
                ? "No notification logs found"
                : "Notification logs retrieved successfully";
        return ResponseEntity.ok(new BaseResponse<>(true, logs, message));
    }

    @Operation(summary = "Get reminder notification logs", description = "Retrieve notification history for a specific reminder")
    @GetMapping("/reminder/{id}")
    public ResponseEntity<BaseResponse<List<NotificationLogResponse>>> getNotificationLogsByReminder(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<NotificationLogResponse> logs = notificationLogService.getNotificationLogsByReminder(id, currentUser, page,
                size);
        String message = logs.isEmpty()
                ? "No notification logs found for this reminder"
                : "Reminder logs retrieved successfully";
        return ResponseEntity.ok(new BaseResponse<>(true, logs, message));
    }
}
