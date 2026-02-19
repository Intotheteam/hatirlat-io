package com.hatirlat.backend.controller;

import com.hatirlat.backend.dto.*;
import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.service.ReminderService;
import com.hatirlat.backend.aop.LimitedForFree;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reminders")
@Tag(name = "Reminders", description = "Reminder management endpoints")
public class ReminderController {

    private final ReminderService reminderService;

    public ReminderController(ReminderService reminderService) {
        this.reminderService = reminderService;
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
    @DeleteMapping("/{id}")
    public ResponseEntity<BaseResponse<Void>> deleteReminder(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser) {
        reminderService.deleteReminder(id, currentUser);
        return ResponseEntity.ok(new BaseResponse<>(true, null, "Reminder deleted successfully"));
    }
}
