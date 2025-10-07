package com.hatirlat.backend.exception;

public abstract class BaseException extends RuntimeException {
    protected String errorCode;
    protected String errorMessage;

    public BaseException(String message) {
        super(message);
        this.errorMessage = message;
    }

    public BaseException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.errorMessage = message;
    }

    public BaseException(String message, Throwable cause) {
        super(message, cause);
        this.errorMessage = message;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public String getErrorMessage() {
        return errorMessage;
    }
}