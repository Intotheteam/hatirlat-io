package com.hatirlat.backend.aop;

import com.hatirlat.backend.entity.User;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Aspect
@Component
public class PremiumAccessAspect {

    private static final Logger log = LoggerFactory.getLogger(PremiumAccessAspect.class);

    @Around("@within(com.hatirlat.backend.aop.PremiumOnly) || @annotation(com.hatirlat.backend.aop.PremiumOnly)")
    public Object checkPremiumAccess(ProceedingJoinPoint pjp) throws Throwable {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            log.debug("Premium check failed: unauthenticated or principal not User");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Premium feature requires authentication");
        }

        User currentUser = (User) authentication.getPrincipal();
        if (!currentUser.isPremium()) {
            log.debug("Premium check failed: user={} is not premium", currentUser.getUsername());
            throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED, "Premium subscription required");
        }

        return pjp.proceed();
    }
}


