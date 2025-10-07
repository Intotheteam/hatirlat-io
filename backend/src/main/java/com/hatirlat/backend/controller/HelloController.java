package com.hatirlat.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "Home", description = "Home and authentication endpoints")
public class HelloController {
    
    @Operation(
        summary = "Home endpoint",
        description = "Returns a welcome message for the Hatirlat.io Backend API"
    )
    @GetMapping("/")
    public String home() {
        return "Welcome to Hatirlat.io Backend API!";
    }

    @Operation(
        summary = "User endpoint",
        description = "Protected endpoint that returns a message for authenticated users",
        responses = {
            @ApiResponse(responseCode = "200", description = "Successfully returned user message"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - user not authenticated")
        }
    )
    @GetMapping("/user")
    public String userEndpoint(Authentication authentication) {
        return "Hello " + authentication.getName() + "! This is a user-level endpoint.";
    }

    @Operation(
        summary = "Admin endpoint",
        description = "Protected endpoint that returns a message for authenticated admins",
        responses = {
            @ApiResponse(responseCode = "200", description = "Successfully returned admin message"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - user not authenticated"),
            @ApiResponse(responseCode = "403", description = "Forbidden - user does not have admin role")
        }
    )
    @GetMapping("/admin")
    public String adminEndpoint(Authentication authentication) {
        return "Hello " + authentication.getName() + "! This is an admin-level endpoint.";
    }
}