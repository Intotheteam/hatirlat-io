package com.hatirlat.backend.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class EnumUtils {

    private static final Logger log = LoggerFactory.getLogger(EnumUtils.class);

    public static <T extends Enum<T>> T parseEnumSafely(String value, Class<T> enumClass, T defaultValue) {
        if (value == null || value.trim().isEmpty()) {
            return defaultValue;
        }
        try {
            return Enum.valueOf(enumClass, value.toUpperCase(java.util.Locale.ENGLISH).trim());
        } catch (IllegalArgumentException e) {
            log.debug("Invalid enum value '{}' for {}, using default: {}", value, enumClass.getSimpleName(),
                    defaultValue);
            return defaultValue;
        }
    }
}