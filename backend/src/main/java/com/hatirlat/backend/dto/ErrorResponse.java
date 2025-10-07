package com.hatirlat.backend.dto;

public class ErrorResponse {
    private boolean success;
    private ErrorDetails error;

    public ErrorResponse() {}

    public ErrorResponse(String code, String message) {
        this.success = false;
        this.error = new ErrorDetails(code, message);
    }

    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    
    public ErrorDetails getError() { return error; }
    public void setError(ErrorDetails error) { this.error = error; }

    public static class ErrorDetails {
        private String code;
        private String message;
        private String details;

        public ErrorDetails() {}

        public ErrorDetails(String code, String message) {
            this.code = code;
            this.message = message;
        }

        // Getters and Setters
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public String getDetails() { return details; }
        public void setDetails(String details) { this.details = details; }
    }
}