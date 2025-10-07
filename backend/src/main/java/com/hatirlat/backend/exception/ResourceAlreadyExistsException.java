package com.hatirlat.backend.exception;

public class ResourceAlreadyExistsException extends BaseException {
    public ResourceAlreadyExistsException(String message) {
        super("RESOURCE_ALREADY_EXISTS", message);
    }

    public ResourceAlreadyExistsException(String resourceType, String identifier) {
        super("RESOURCE_ALREADY_EXISTS", String.format("%s already exists with identifier: %s", resourceType, identifier));
    }
}