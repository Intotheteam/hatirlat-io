package com.hatirlat.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hatirlat.backend.service.SystemConfigService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Checks every /api/admin/** request against the IP whitelist stored in SystemConfig.
 * If admin.ip.whitelist is empty → no restriction (all IPs allowed).
 * If non-empty (comma-separated) → only listed IPs may proceed.
 * Handles X-Forwarded-For and X-Real-IP proxy headers.
 * Normalizes IPv4-mapped IPv6 addresses (::ffff:1.2.3.4 → 1.2.3.4).
 */
@Component
@Order(1)
public class AdminIpWhitelistFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(AdminIpWhitelistFilter.class);
    private static final String WHITELIST_KEY = "admin.ip.whitelist";
    private static final String ADMIN_PATH_PREFIX = "/api/admin/";

    @Autowired
    private SystemConfigService configService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Only apply to admin API paths
        if (!path.startsWith(ADMIN_PATH_PREFIX)) {
            chain.doFilter(request, response);
            return;
        }

        // Read whitelist from DB (may be null/empty → no restriction)
        String whitelistValue = null;
        try {
            whitelistValue = configService.getConfig(WHITELIST_KEY);
        } catch (Exception e) {
            logger.warn("Failed to read admin.ip.whitelist from DB — allowing request: {}", e.getMessage());
        }

        if (whitelistValue == null || whitelistValue.isBlank()) {
            chain.doFilter(request, response);
            return;
        }

        List<String> allowedIps = Arrays.stream(whitelistValue.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();

        if (allowedIps.isEmpty()) {
            chain.doFilter(request, response);
            return;
        }

        String clientIp = resolveClientIp(request);
        String normalizedIp = normalizeIp(clientIp);

        boolean allowed = allowedIps.stream()
                .anyMatch(allowed -> allowed.equals(normalizedIp) || allowed.equals(clientIp));

        if (allowed) {
            chain.doFilter(request, response);
        } else {
            logger.warn("Admin access denied for IP: {} (normalized: {}) — path: {}", clientIp, normalizedIp, path);
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(objectMapper.writeValueAsString(
                    Map.of("success", false, "message", "Erişim reddedildi: IP adresiniz yetkili listesinde yok.",
                            "data", clientIp)
            ));
        }
    }

    /**
     * Resolves the real client IP from common proxy headers.
     * X-Forwarded-For may contain multiple IPs (client, proxy1, proxy2) — take the first.
     */
    String resolveClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }
        return request.getRemoteAddr();
    }

    /**
     * Converts IPv4-mapped IPv6 addresses (::ffff:1.2.3.4) to plain IPv4 (1.2.3.4).
     */
    private String normalizeIp(String ip) {
        if (ip != null && ip.startsWith("::ffff:")) {
            return ip.substring(7);
        }
        return ip;
    }
}
