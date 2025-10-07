package com.hatirlat.backend.config;

import com.hatirlat.backend.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // If no Authorization header or not a Bearer token, continue to next filter
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.debug("JWT Filter: Authorization header missing or not Bearer. URI=" + request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        // Extract JWT token from Authorization header
        jwt = authHeader.substring(7);
        
        try {
            // Extract username from JWT token
            username = jwtService.extractUsername(jwt);
            logger.debug("JWT Filter: Parsed username=" + username + " URI=" + request.getRequestURI());
            
            // If username exists and no authentication exists in SecurityContext
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Load user details from database
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                
                // Validate JWT token
                boolean valid = jwtService.isTokenValid(jwt, userDetails);
                logger.debug("JWT Filter: isTokenValid=" + valid + " for user=" + username);
                if (valid) {
                    // Create authentication token
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    
                    // Set authentication details
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // Set authentication in SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    logger.debug("JWT Filter: Token invalid, skipping authentication for URI=" + request.getRequestURI());
                }
            }
        } catch (Exception e) {
            logger.error("JWT Authentication failed: " + e.getMessage());
        }
        
        // Continue filter chain
        filterChain.doFilter(request, response);
    }
}