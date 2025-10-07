package com.hatirlat.backend.config;

import static org.springframework.security.config.Customizer.withDefaults;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
// removed unused import
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.core.annotation.Order;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private EndpointSecurityProperties endpointSecurityProperties;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf
                    // Disable CSRF for API endpoints
                    .ignoringRequestMatchers("/api/**")
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> {
                        // permitAll patterns from configuration
                        endpointSecurityProperties.getPermitAll().forEach(pattern ->
                                authz.requestMatchers(pattern).permitAll()
                        );

                        // role-based routes from configuration
                        endpointSecurityProperties.getRoutes().forEach(route -> {
                                String[] roles = route.getRoles().toArray(new String[0]);
                                authz.requestMatchers(route.getPattern()).hasAnyRole(roles);
                        });

                        // all others need authentication
                        authz.anyRequest().authenticated();
                })
                // Add JWT authentication filter before UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                // For H2 Console
                .headers(headers -> headers
                    .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
                    // Add security headers to prevent XSS attacks
                    .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'; frame-ancestors 'self'; form-action 'self'"))
                    .contentTypeOptions(withDefaults()));
        
        return http.build();
    }

    @Bean
    @Order(0)
    public SecurityFilterChain scalarFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/scalar/**", "/favicon.ico")
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/scalar/**").permitAll()
                .requestMatchers("/favicon.ico").permitAll()
                .anyRequest().permitAll()
            )
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.sameOrigin())
                .contentSecurityPolicy(csp -> csp.policyDirectives(
                    "default-src 'self'; " +
                    "script-src 'self' 'unsafe-inline'; " +
                    "style-src 'self' 'unsafe-inline'; " +
                    "img-src 'self' data:; " +
                    "connect-src 'self'; " +
                    "frame-ancestors 'self'; " +
                    "form-action 'self'"
                ))
                .contentTypeOptions(withDefaults())
            );

        return http.build();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}