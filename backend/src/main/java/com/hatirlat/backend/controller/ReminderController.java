package com.hatirlat.backend.controller;

import com.hatirlat.backend.dto.*;
import com.hatirlat.backend.entity.Reminder;
import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.service.BulkReminderImportService;
import com.hatirlat.backend.service.IcsService;
import com.hatirlat.backend.service.NotificationPreviewService;
import com.hatirlat.backend.service.ReminderService;
import com.hatirlat.backend.aop.LimitedForFree;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/reminders")
@Tag(name = "Reminders", description = "Reminder management endpoints")
public class ReminderController {

    private final ReminderService reminderService;
    private final IcsService icsService;
    private final BulkReminderImportService bulkReminderImportService;
    private final NotificationPreviewService notificationPreviewService;

    public ReminderController(ReminderService reminderService, IcsService icsService,
            BulkReminderImportService bulkReminderImportService,
            NotificationPreviewService notificationPreviewService) {
        this.reminderService = reminderService;
        this.icsService = icsService;
        this.bulkReminderImportService = bulkReminderImportService;
        this.notificationPreviewService = notificationPreviewService;
    }

    @Operation(
            summary = "Get all reminders",
            description = "Retrieve all reminders for the authenticated user",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Successfully retrieved reminders",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ReminderResponse.class))
                    )
            }
    )
    @GetMapping
    public ResponseEntity<BaseResponse<List<ReminderResponse>>> getAllReminders(
            @RequestParam(required = false) String q,
            @AuthenticationPrincipal User currentUser) {
        List<ReminderResponse> reminders = (q != null && !q.trim().isEmpty())
            ? reminderService.searchReminders(q.trim(), currentUser)
            : reminderService.getAllReminders(currentUser);
        String message = reminders.isEmpty()
            ? "No reminders found"
            : "Reminders retrieved successfully";
        return ResponseEntity.ok(new BaseResponse<>(true, reminders, message));
    }

    @Operation(
            summary = "Get all reminders (paginated)",
            description = "Retrieve reminders with pagination support"
    )
    @GetMapping("/paged")
    public ResponseEntity<BaseResponse<PageResponse<ReminderResponse>>> getAllRemindersPaged(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User currentUser) {
        PageResponse<ReminderResponse> pageResponse = (q != null && !q.trim().isEmpty())
            ? reminderService.searchRemindersPaged(q.trim(), currentUser, page, size)
            : reminderService.getAllRemindersPaged(currentUser, page, size);
        return ResponseEntity.ok(new BaseResponse<>(true, pageResponse, "Reminders retrieved successfully"));
    }

    @Operation(
            summary = "Get reminder by ID",
            description = "Retrieve a specific reminder by its ID",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Successfully retrieved reminder",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ReminderResponse.class))
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Reminder not found"
                    )
            }
    )
    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse<ReminderResponse>> getReminderById(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser) {
        ReminderResponse reminder = reminderService.getReminderById(id, currentUser);
        return ResponseEntity.ok(new BaseResponse<>(true, reminder, "Reminder retrieved successfully"));
    }

    @Operation(
            summary = "Create a new reminder",
            description = "Create a new reminder",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Successfully created reminder",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ReminderResponse.class))
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Invalid request data"
                    )
            }
    )
    @PostMapping
    @LimitedForFree(key = "createReminder")
    public ResponseEntity<BaseResponse<ReminderResponse>> createReminder(
            @Valid @RequestBody ReminderRequest request,
            @AuthenticationPrincipal User currentUser) {
        ReminderResponse createdReminder = reminderService.createReminder(request, currentUser);
        return ResponseEntity.ok(new BaseResponse<>(true, createdReminder, "Reminder created successfully"));
    }

    @Operation(
            summary = "Update a reminder",
            description = "Update an existing reminder",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Successfully updated reminder",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ReminderResponse.class))
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Reminder not found"
                    )
            }
    )
    @PutMapping("/{id}")
    public ResponseEntity<BaseResponse<ReminderResponse>> updateReminder(
            @PathVariable String id,
            @Valid @RequestBody ReminderRequest request,
            @AuthenticationPrincipal User currentUser) {
        ReminderResponse updatedReminder = reminderService.updateReminder(id, request, currentUser);
        return ResponseEntity.ok(new BaseResponse<>(true, updatedReminder, "Reminder updated successfully"));
    }

    @Operation(
            summary = "Update reminder status",
            description = "Update the status of a reminder",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Successfully updated reminder status",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ReminderResponse.class))
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Reminder not found"
                    )
            }
    )
    @PutMapping("/{id}/status")
    public ResponseEntity<BaseResponse<ReminderResponse>> updateReminderStatus(
            @PathVariable String id,
            @Valid @RequestBody StatusUpdateRequest statusRequest,
            @AuthenticationPrincipal User currentUser) {
        ReminderResponse updatedReminder = reminderService.updateReminderStatus(id, statusRequest.getStatus(), currentUser);
        return ResponseEntity.ok(new BaseResponse<>(true, updatedReminder, "Reminder status updated successfully"));
    }

    @Operation(
            summary = "Delete a reminder",
            description = "Delete a reminder by its ID",
            responses = {
                    @ApiResponse(
                            responseCode = "204",
                            description = "Successfully deleted reminder"
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Reminder not found"
                    )
            }
    )
    @Operation(summary = "Preview reminder delivery",
            description = "Returns the per-recipient breakdown that would result from sending this reminder, without contacting any provider")
    @GetMapping("/{id}/preview")
    public ResponseEntity<BaseResponse<NotificationPreview>> previewDelivery(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser) {
        Reminder reminder = reminderService.getReminderEntity(id, currentUser);
        NotificationPreview preview = notificationPreviewService.build(reminder);
        return ResponseEntity.ok(new BaseResponse<>(true, preview, null));
    }

    @Operation(summary = "Bulk import reminders", description = "Create up to 500 reminders from a parsed CSV/JSON payload")
    @PostMapping("/bulk")
    public ResponseEntity<BaseResponse<BulkImportResult>> bulkImport(
            @Valid @RequestBody BulkImportRequest request,
            @AuthenticationPrincipal User currentUser) {
        BulkImportResult result = bulkReminderImportService.importRows(request, currentUser);
        String msg = String.format("%d/%d başarıyla içe aktarıldı", result.getCreated(), result.getTotal());
        return ResponseEntity.ok(new BaseResponse<>(true, result, msg));
    }

    @Operation(summary = "Download reminder as .ics", description = "Returns RFC 5545 iCalendar file for the reminder")
    @GetMapping("/{id}/ics")
    public ResponseEntity<byte[]> downloadIcs(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser) {
        Reminder reminder = reminderService.getReminderEntity(id, currentUser);
        String body = icsService.build(reminder);
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        String filename = "reminder-" + reminder.getId() + ".ics";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/calendar; charset=UTF-8"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(bytes);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<BaseResponse<Void>> deleteReminder(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser) {
        reminderService.deleteReminder(id, currentUser);
        return ResponseEntity.ok(new BaseResponse<>(true, null, "Reminder deleted successfully"));
    }
}
