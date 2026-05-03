package com.hatirlat.backend.notification;

import com.hatirlat.backend.service.SystemConfigService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Sends SMS via Netgsm HTTP API — used for Turkish numbers (+90).
 * API docs: https://www.netgsm.com.tr/dokuman/#sms-gonder
 */
@Component
public class NetgsmSmsStrategy {

    private static final Logger logger = LoggerFactory.getLogger(NetgsmSmsStrategy.class);

    private static final String API_URL = "https://api.netgsm.com.tr/sms/send/get";

    // Response code prefix returned by Netgsm on success: "00 <msgid>"
    private static final String SUCCESS_CODE = "00";

    @Value("${netgsm.usercode:}")
    private String usercode;

    @Value("${netgsm.password:}")
    private String password;

    @Value("${netgsm.msgheader:HATIRLAT}")
    private String msgheader;

    @Value("${netgsm.sms.enabled:false}")
    private boolean smsEnabled;

    @Autowired
    private SystemConfigService configService;

    private String resolve(String dbKey, String envFallback) {
        try {
            String v = configService.getConfig(dbKey);
            return (v != null && !v.isBlank()) ? v : (envFallback != null ? envFallback : "");
        } catch (Exception e) {
            return envFallback != null ? envFallback : "";
        }
    }

    private boolean resolveBoolean(String dbKey, boolean envFallback) {
        try {
            String v = configService.getConfig(dbKey);
            return v != null ? Boolean.parseBoolean(v) : envFallback;
        } catch (Exception e) {
            return envFallback;
        }
    }

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public DeliveryResult send(String recipient, String message, String subject) {
        boolean enabled = resolveBoolean("integration.netgsm.enabled", smsEnabled);
        if (!enabled) {
            logger.warn("Netgsm SMS disabled — would send to {}: {}", recipient, message);
            return DeliveryResult.disabled("NetgsmSMS").withProvider("NETGSM");
        }

        String uc  = resolve("integration.netgsm.usercode",  usercode);
        String pwd = resolve("integration.netgsm.password",  password);
        String hdr = resolve("integration.netgsm.msgheader", msgheader);

        if (uc.isBlank() || pwd.isBlank()) {
            logger.error("Netgsm credentials are not configured (NETGSM_USERCODE / NETGSM_PASSWORD).");
            return DeliveryResult.failure("CONFIG_ERROR", "Netgsm credentials are not configured").withProvider("NETGSM");
        }

        // Netgsm expects number without country code: 5XXXXXXXXX
        String normalizedNumber = normalizeToNetgsmFormat(recipient);
        if (normalizedNumber == null) {
            logger.error("Cannot normalize phone number for Netgsm: {}", recipient);
            return DeliveryResult.failure("INVALID_NUMBER", "Cannot normalize number: " + recipient).withProvider("NETGSM");
        }

        String fullMessage = "[Hatirlat.io] " + subject + "\n" + message;

        try {
            URI uri = UriComponentsBuilder.fromHttpUrl(API_URL)
                    .queryParam("usercode", uc)
                    .queryParam("password", pwd)
                    .queryParam("gsmno", normalizedNumber)
                    .queryParam("text", fullMessage)
                    .queryParam("msgheader", hdr)
                    .queryParam("dil", "TR")
                    .build()
                    .toUri();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(uri)
                    .timeout(Duration.ofSeconds(15))
                    .GET()
                    .build();

            logger.info("Sending SMS via Netgsm to: {}", normalizedNumber);

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            String responseBody = response.body() != null ? response.body().trim() : "";

            if (response.statusCode() == 200 && responseBody.startsWith(SUCCESS_CODE)) {
                // Response format: "00 <msgid>"
                String msgId = responseBody.length() > 3 ? responseBody.substring(3).trim() : responseBody;
                logger.info("Netgsm SMS sent. msgId={} to={}", msgId, normalizedNumber);
                return DeliveryResult.success(msgId, "sent",
                        "provider=netgsm to=" + normalizedNumber + " msgId=" + msgId).withProvider("NETGSM");
            } else {
                logger.error("Netgsm SMS failed. status={} response={}", response.statusCode(), responseBody);
                return DeliveryResult.failure(responseBody, resolveNetgsmError(responseBody)).withProvider("NETGSM");
            }

        } catch (Exception e) {
            logger.error("Failed to send SMS via Netgsm to {}: {}", normalizedNumber, e.getMessage());
            return DeliveryResult.failure("NETWORK_ERROR", e.getMessage()).withProvider("NETGSM");
        }
    }

    /**
     * Converts E.164 (+905XXXXXXXXX) or local (05XXXXXXXXX) format to
     * Netgsm format (5XXXXXXXXX).
     * Returns null if the number cannot be recognized as Turkish.
     */
    private String normalizeToNetgsmFormat(String phone) {
        if (phone == null) return null;
        String digits = phone.replaceAll("[^0-9]", "");

        if (digits.startsWith("90") && digits.length() == 12) {
            // +905XXXXXXXXX → 5XXXXXXXXX
            return digits.substring(2);
        } else if (digits.startsWith("0") && digits.length() == 11) {
            // 05XXXXXXXXX → 5XXXXXXXXX
            return digits.substring(1);
        } else if (digits.startsWith("5") && digits.length() == 10) {
            // already 5XXXXXXXXX
            return digits;
        }
        return null;
    }

    /**
     * Human-readable error descriptions for Netgsm response codes.
     */
    private String resolveNetgsmError(String code) {
        return switch (code.trim()) {
            case "20" -> "Authentication failed (invalid usercode or password)";
            case "30" -> "Invalid recipient number";
            case "40" -> "Message too long";
            case "50" -> "Account credit is insufficient";
            case "51" -> "Account is blocked";
            case "70" -> "Invalid sender header (msgheader)";
            case "85" -> "User is blocked due to spam";
            default   -> "Unknown Netgsm error: " + code;
        };
    }
}
