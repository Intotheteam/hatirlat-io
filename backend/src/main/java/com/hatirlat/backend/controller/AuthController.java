package com.hatirlat.backend.controller;

import com.hatirlat.backend.dto.AuthRequest;
import com.hatirlat.backend.dto.AuthResponse;
import com.hatirlat.backend.dto.BaseResponse;
import com.hatirlat.backend.dto.UserRequest;
import com.hatirlat.backend.dto.UserResponse;
import com.hatirlat.backend.entity.Role;
import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.service.AuthService;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api/auth")
@Tag(name = "Authentication", description = "Authentication endpoints")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Operation(
        summary = "Login",
        description = "Authenticate user and return JWT token",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Successfully authenticated",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(responseCode = "401", description = "Invalid credentials")
        }
    )
    @PostMapping(value = "/login")
    public ResponseEntity<BaseResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse authResponse = authService.authenticate(request);
        return ResponseEntity.ok(new BaseResponse<>(true, authResponse, "Login successful"));
    }

    @Operation(
        summary = "Register",
        description = "Register a new user account",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Successfully registered user",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Invalid registration data")
        }
    )
    @PostMapping(value = "/register")
    public ResponseEntity<BaseResponse<AuthResponse>> register(@Valid @RequestBody UserRequest userRequest) {
        AuthResponse authResponse = authService.registerAndAuthenticate(
            userRequest.getUsername(),
            userRequest.getPassword(),
            userRequest.getEmail(),
            userRequest.getRole() != null ? Role.valueOf(userRequest.getRole()) : Role.USER
        );
        return ResponseEntity.ok(new BaseResponse<>(true, authResponse, "Registration successful"));
    }

    @Operation(
        summary = "Get current user",
        description = "Get information about the currently authenticated user",
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Successfully retrieved user info",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserResponse.class))
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorized - user not authenticated")
        }
    )
    @GetMapping(value = "/me")
    public ResponseEntity<BaseResponse<UserResponse>> getCurrentUser(@AuthenticationPrincipal User currentUser) {
        UserResponse userResponse = new UserResponse();
        userResponse.setId(String.valueOf(currentUser.getId()));
        userResponse.setUsername(currentUser.getUsername());
        userResponse.setEmail(currentUser.getEmail());
        userResponse.setRole(currentUser.getRole().name());

        BaseResponse<UserResponse> response = new BaseResponse<>(true, userResponse, "User info retrieved successfully");
        return ResponseEntity.ok(response);
    }
}
