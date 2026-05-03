package com.hatirlat.backend.notification;

/**
 * Returned by every NotificationStrategy.sendNotification().
 * Contains the provider's delivery response for logging purposes.
 */
public class DeliveryResult {

    private final boolean success;
    private final String providerMessageId; // Twilio SID, SMTP messageId, etc.
    private final String providerStatus; // "queued", "sent", "delivered", "failed", "250 OK", etc.
    private final String providerErrorCode; // Twilio error code, SMTP error, etc.
    private final String providerResponse; // Raw response or summary
    private String provider; // e.g. "NETGSM", "TWILIO_SMS", "TWILIO_WHATSAPP", "SMTP"

    private DeliveryResult(boolean success, String providerMessageId, String providerStatus,
            String providerErrorCode, String providerResponse) {
        this.success = success;
        this.providerMessageId = providerMessageId;
        this.providerStatus = providerStatus;
        this.providerErrorCode = providerErrorCode;
        this.providerResponse = providerResponse;
    }

    public static DeliveryResult success(String messageId, String status) {
        return new DeliveryResult(true, messageId, status, null,
                "messageId=" + messageId + " status=" + status);
    }

    public static DeliveryResult success(String messageId, String status, String extraInfo) {
        return new DeliveryResult(true, messageId, status, null, extraInfo);
    }

    public static DeliveryResult failure(String errorCode, String errorMessage) {
        return new DeliveryResult(false, null, "failed", errorCode, errorMessage);
    }

    public static DeliveryResult disabled(String channel) {
        return new DeliveryResult(true, null, "disabled", null, channel + " channel is disabled");
    }

    /** Fluent helper to set the provider name on an existing result */
    public DeliveryResult withProvider(String provider) {
        this.provider = provider;
        return this;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getProviderMessageId() {
        return providerMessageId;
    }

    public String getProviderStatus() {
        return providerStatus;
    }

    public String getProviderErrorCode() {
        return providerErrorCode;
    }

    public String getProviderResponse() {
        return providerResponse;
    }

    public String getProvider() {
        return provider;
    }
}
