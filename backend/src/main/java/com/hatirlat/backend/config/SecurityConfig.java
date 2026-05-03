package com.hatirlat.backend.config;

import static org.springframework.security.config.Customizer.withDefaults;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.core.annotation.Order;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private AdminIpWhitelistFilter adminIpWhitelistFilter;

    @Autowired
    private EndpointSecurityProperties endpointSecurityProperties;

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Bean
    @Order(1)
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> {
                        // Explicitly permit OPTIONS requests for all endpoints (needed for CORS preflight)
                        authz.requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll();

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
                // IP whitelist runs first, then JWT validation
                .addFilterBefore(adminIpWhitelistFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthenticationFilter, AdminIpWhitelistFilter.class)
                // For H2 Console
                .headers(headers -> headers
                    .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
                    .contentTypeOptions(withDefaults()));

        return http.build();
    }

    @Bean
    @Order(0)
    public SecurityFilterChain scalarFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/scalar/**", "/favicon.ico")
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/scalar/**").permitAll()
                .requestMatchers("/favicon.ico").permitAll()
                .anyRequest().permitAll()
            )
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.sameOrigin())
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
