package com.hatirlat.backend.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Utility class for structured logging throughout the application
 */
@Component
public class LoggingUtil {
    
    private static final Logger logger = LoggerFactory.getLogger(LoggingUtil.class);
    
    public void logServiceMethodEntry(String serviceClassName, String methodName, Object... parameters) {
        logger.debug("Entering method: {}.{} with parameters: {}", serviceClassName, methodName, parameters);
    }
    
    public void logServiceMethodExit(String serviceClassName, String methodName, Object result) {
        logger.debug("Exiting method: {}.{} with result: {}", serviceClassName, methodName, result);
    }
    
    public void logServiceMethodError(String serviceClassName, String methodName, Exception ex) {
        logger.error("Error in method: {}.{} with exception: {}", serviceClassName, methodName, ex.getMessage(), ex);
    }
    
    public void logDatabaseOperation(String operation, String entityName, Object identifier) {
        logger.info("Database operation: {} performed on entity: {} with ID: {}", operation, entityName, identifier);
    }
    
    public void logSecurityEvent(String eventType, String user, String resource) {
        logger.info("Security event: {} for user: {} on resource: {}", eventType, user, resource);
    }
}