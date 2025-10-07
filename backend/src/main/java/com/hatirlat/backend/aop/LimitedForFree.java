package com.hatirlat.backend.aop;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface LimitedForFree {
    String key() default "";
    int maxRequests() default -1;
    int perSeconds() default -1;
}


