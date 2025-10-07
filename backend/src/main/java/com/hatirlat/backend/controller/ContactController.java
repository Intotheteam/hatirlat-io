package com.hatirlat.backend.controller;

import com.hatirlat.backend.dto.*;
import com.hatirlat.backend.service.ContactService;
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
@RequestMapping("/api/contacts")
@Tag(name = "Contacts", description = "Contact management endpoints")
public class ContactController {

    @Autowired
    private ContactService contactService;

    @Operation(
            summary = "Get all contacts",
            description = "Retrieve all contacts for the authenticated user",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Successfully retrieved contacts",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ContactResponse.class))
                    )
            }
    )
    @GetMapping
    public ResponseEntity<BaseResponse<List<ContactResponse>>> getAllContacts() {
        List<ContactResponse> contacts = contactService.getAllContacts();
        return ResponseEntity.ok(new BaseResponse<>(true, contacts, "Contacts retrieved successfully"));
    }

    @Operation(
            summary = "Create a new contact",
            description = "Create a new contact",
            responses = {
                    @ApiResponse(
                            responseCode = "201",
                            description = "Successfully created contact",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ContactResponse.class))
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Invalid request data"
                    )
            }
    )
    @PostMapping
    public ResponseEntity<BaseResponse<ContactResponse>> createContact(@RequestBody ContactRequest request) {
        ContactResponse createdContact = contactService.createContact(request);
        return ResponseEntity.ok(new BaseResponse<>(true, createdContact, "Contact created successfully"));
    }

    @Operation(
            summary = "Update a contact",
            description = "Update an existing contact",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Successfully updated contact",
                            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ContactResponse.class))
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Contact not found"
                    )
            }
    )
    @PutMapping("/{id}")
    public ResponseEntity<BaseResponse<ContactResponse>> updateContact(@PathVariable String id, @RequestBody ContactRequest request) {
        ContactResponse updatedContact = contactService.updateContact(id, request);
        if (updatedContact != null) {
            return ResponseEntity.ok(new BaseResponse<>(true, updatedContact, "Contact updated successfully"));
        } else {
            return ResponseEntity.ok(new BaseResponse<>(false, null, "Contact not found"));
        }
    }

    @Operation(
            summary = "Delete a contact",
            description = "Delete a contact by its ID",
            responses = {
                    @ApiResponse(
                            responseCode = "204",
                            description = "Successfully deleted contact"
                    ),
                    @ApiResponse(
                            responseCode = "404",
                            description = "Contact not found"
                    )
            }
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<BaseResponse<Void>> deleteContact(@PathVariable String id) {
        boolean deleted = contactService.deleteContact(id);
        if (deleted) {
            return ResponseEntity.ok(new BaseResponse<>(true, null, "Contact deleted successfully"));
        } else {
            return ResponseEntity.ok(new BaseResponse<>(false, null, "Contact not found"));
        }
    }
}