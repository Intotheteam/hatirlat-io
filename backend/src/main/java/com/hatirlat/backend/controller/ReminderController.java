package com.hatirlat.backend.controller;

import com.hatirlat.backend.dto.*;
import com.hatirlat.backend.service.ReminderService;
import com.hatirlat.backend.aop.LimitedForFree;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reminders")
@Tag(name = "Reminders", description = "Reminder management endpoints")
public class ReminderController {

    @Autowired
    private ReminderService reminderService;

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
    public ResponseEntity<BaseResponse<List<ReminderResponse>>> getAllReminders() {
        List<ReminderResponse> reminders = reminderService.getAllReminders();
        return ResponseEntity.ok(new BaseResponse<>(true, reminders, "Reminders retrieved successfully"));
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
    public ResponseEntity<BaseResponse<ReminderResponse>> getReminderById(@PathVariable String id) {
        ReminderResponse reminder = reminderService.getReminderById(id);
        if (reminder != null) {
            return ResponseEntity.ok(new BaseResponse<>(true, reminder, "Reminder retrieved successfully"));
        } else {
            return ResponseEntity.ok(new BaseResponse<>(false, null, "Reminder not found"));
        }
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
    public ResponseEntity<BaseResponse<ReminderResponse>> createReminder(@RequestBody ReminderRequest request) {
        ReminderResponse createdReminder = reminderService.createReminder(request);
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
    public ResponseEntity<BaseResponse<ReminderResponse>> updateReminder(@PathVariable String id, @RequestBody ReminderRequest request) {
        ReminderResponse updatedReminder = reminderService.updateReminder(id, request);
        if (updatedReminder != null) {
            return ResponseEntity.ok(new BaseResponse<>(true, updatedReminder, "Reminder updated successfully"));
        } else {
            return ResponseEntity.ok(new BaseResponse<>(false, null, "Reminder not found"));
        }
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
    public ResponseEntity<BaseResponse<ReminderResponse>> updateReminderStatus(@PathVariable String id, @RequestBody StatusUpdateRequest statusRequest) {
        ReminderResponse updatedReminder = reminderService.updateReminderStatus(id, statusRequest.getStatus());
        if (updatedReminder != null) {
            return ResponseEntity.ok(new BaseResponse<>(true, updatedReminder, "Reminder status updated successfully"));
        } else {
            return ResponseEntity.ok(new BaseResponse<>(false, null, "Reminder not found"));
        }
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
    public ResponseEntity<BaseResponse<Void>> deleteReminder(@PathVariable String id) {
        boolean deleted = reminderService.deleteReminder(id);
        if (deleted) {
            return ResponseEntity.ok(new BaseResponse<>(true, null, "Reminder deleted successfully"));
        } else {
            return ResponseEntity.ok(new BaseResponse<>(false, null, "Reminder not found"));
        }
    }
}