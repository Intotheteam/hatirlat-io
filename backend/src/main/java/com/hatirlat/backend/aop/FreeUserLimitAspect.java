package com.hatirlat.backend.aop;

import com.hatirlat.backend.config.FreeLimitProperties;
import com.hatirlat.backend.entity.User;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Aspect
@Component
public class FreeUserLimitAspect {

    private static final Logger log = LoggerFactory.getLogger(FreeUserLimitAspect.class);

    private final Map<String, Deque<Long>> userRequestTimestamps = new ConcurrentHashMap<>();

    @Autowired
    private FreeLimitProperties freeLimitProperties;

    @Around("@annotation(limited)")
    public Object enforceLimit(ProceedingJoinPoint pjp, LimitedForFree limited) throws Throwable {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Authentication required");
        }

        User user = (User) authentication.getPrincipal();
        if (user.isPremium()) {
            return pjp.proceed();
        }

        String ruleKey = limited.key().isEmpty() ? pjp.getSignature().toShortString() : limited.key();
        FreeLimitProperties.Rule rule = freeLimitProperties.getRules().get(ruleKey);

        int maxRequests = limited.maxRequests() > 0 ? limited.maxRequests() :
                (rule != null && rule.getMaxRequests() > 0 ? rule.getMaxRequests() : freeLimitProperties.getDefaultMaxRequests());
        int perSeconds = limited.perSeconds() > 0 ? limited.perSeconds() :
                (rule != null && rule.getPerSeconds() > 0 ? rule.getPerSeconds() : freeLimitProperties.getDefaultPerSeconds());

        long now = Instant.now().getEpochSecond();
        String key = user.getUsername() + "|" + ruleKey;

        Deque<Long> timestamps = userRequestTimestamps.computeIfAbsent(key, k -> new ArrayDeque<>());

        // Evict timestamps outside the window
        while (!timestamps.isEmpty() && (now - timestamps.peekFirst()) >= perSeconds) {
            timestamps.pollFirst();
        }

        if (timestamps.size() >= maxRequests) {
            log.debug("Rate limit exceeded for user={}, key={}", user.getUsername(), key);
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Free plan limit exceeded");
        }

        timestamps.addLast(now);
        return pjp.proceed();
    }
}


