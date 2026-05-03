package com.hatirlat.backend.controller;

import com.hatirlat.backend.config.JwtService;
import com.hatirlat.backend.dto.AuthRequest;
import com.hatirlat.backend.dto.AuthResponse;
import com.hatirlat.backend.dto.BaseResponse;
import com.hatirlat.backend.dto.UserRequest;
import com.hatirlat.backend.dto.UserResponse;
import com.hatirlat.backend.entity.Role;
import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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

    @Autowired
    private JwtService jwtService;

    @Operation(summary = "Login", description = "Authenticate user and return JWT token. Also sets an HttpOnly cookie for web clients.", responses = {
            @ApiResponse(responseCode = "200", description = "Successfully authenticated", content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    @PostMapping(value = "/login")
    public ResponseEntity<BaseResponse<AuthResponse>> login(
            @Valid @RequestBody AuthRequest request,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.authenticate(request);

        // Set HttpOnly cookie for Next.js web frontend
        // Mobile (Flutter) still uses the token from the JSON body via Authorization
        // header
        setJwtCookie(response, authResponse.getToken());

        return ResponseEntity.ok(new BaseResponse<>(true, authResponse, "Login successful"));
    }

    @Operation(summary = "Register", description = "Register a new user account", responses = {
            @ApiResponse(responseCode = "200", description = "Successfully registered user", content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid registration data")
    })
    @PostMapping(value = "/register")
    public ResponseEntity<BaseResponse<AuthResponse>> register(
            @Valid @RequestBody UserRequest userRequest,
            HttpServletResponse response) {
        AuthResponse authResponse = authService.registerAndAuthenticate(
                userRequest.getUsername(),
                userRequest.getPassword(),
                userRequest.getEmail(),
                userRequest.getRole() != null ? Role.valueOf(userRequest.getRole()) : Role.USER);

        // Set HttpOnly cookie for web clients
        setJwtCookie(response, authResponse.getToken());

        return ResponseEntity.ok(new BaseResponse<>(true, authResponse, "Registration successful"));
    }

    @Operation(summary = "Logout", description = "Logout: blacklists the current JWT and clears the HttpOnly cookie")
    @PostMapping(value = "/logout")
    public ResponseEntity<BaseResponse<String>> logout(
            @AuthenticationPrincipal User currentUser,
            HttpServletRequest request,
            HttpServletResponse response) {
        // Blacklist the current token so it cannot be reused
        String token = extractTokenFromRequest(request);
        if (token != null) {
            try {
                jwtService.blacklistToken(token);
            } catch (Exception ignored) {
                // Token may already be invalid; proceed with logout anyway
            }
        }

        // Clear the HttpOnly cookie
        clearJwtCookie(response);

        return ResponseEntity.ok(new BaseResponse<>(true, "Logged out successfully", "Logout successful"));
    }

    @Operation(summary = "Get current user", description = "Get information about the currently authenticated user", responses = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved user info", content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - user not authenticated")
    })
    @GetMapping(value = "/me")
    public ResponseEntity<BaseResponse<UserResponse>> getCurrentUser(@AuthenticationPrincipal User currentUser) {
        UserResponse userResponse = new UserResponse();
        userResponse.setId(String.valueOf(currentUser.getId()));
        userResponse.setUsername(currentUser.getUsername());
        userResponse.setEmail(currentUser.getEmail());
        userResponse.setRole(currentUser.getRole().name());
        userResponse.setPremium(currentUser.isPremium());
        userResponse.setCredits(currentUser.getCredits() != null ? currentUser.getCredits() : 0);

        BaseResponse<UserResponse> baseResponse = new BaseResponse<>(true, userResponse,
                "User info retrieved successfully");
        return ResponseEntity.ok(baseResponse);
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private void setJwtCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("jwt_token", token);
        cookie.setHttpOnly(true); // Not accessible via JavaScript (XSS protection)
        cookie.setSecure(false); // Set to true in production (requires HTTPS)
        cookie.setPath("/");
        cookie.setMaxAge(86400); // 24 hours
        // SameSite=Strict is set via header since Java Cookie doesn't support it
        // directly
        response.addCookie(cookie);
        // Add SameSite attribute via Set-Cookie header override
        response.addHeader("Set-Cookie",
                "jwt_token=" + token + "; Path=/; HttpOnly; Max-Age=86400; SameSite=Strict");
    }

    private void clearJwtCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt_token", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        response.addHeader("Set-Cookie",
                "jwt_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict");
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("jwt_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
