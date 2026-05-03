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
 * Sends SMS via İleti Merkezi HTTP API (toplusmsapi.com) — Turkish numbers.
 * API docs: https://www.toplusmsapi.com
 * Endpoint: https://api.iletimerkezi.com/v1/send-sms/get/
 */
@Component
public class IletiMerkeziSmsStrategy {

    private static final Logger logger = LoggerFactory.getLogger(IletiMerkeziSmsStrategy.class);

    private static final String API_URL = "https://api.iletimerkezi.com/v1/send-sms/get/";

    // Status codes returned in XML response <status><code>
    private static final String STATUS_SENDING   = "110";
    private static final String STATUS_SENT      = "111";
    private static final String STATUS_COMPLETED = "114";
    private static final String STATUS_OK        = "200";

    @Value("${iletimerkezi.key:}")
    private String apiKey;

    @Value("${iletimerkezi.hash:}")
    private String apiHash;

    @Value("${iletimerkezi.sender:HATIRLAT}")
    private String sender;

    @Value("${iletimerkezi.sms.enabled:false}")
    private boolean smsEnabled;

    // IYS (İleti Yönetim Sistemi) consent settings
    // iys=1 required for commercial messages; iysList=BIREYSEL for individual, TACIR for commercial
    @Value("${iletimerkezi.iys:1}")
    private String iys;

    @Value("${iletimerkezi.iys-list:BIREYSEL}")
    private String iysList;

    @Autowired
    private SystemConfigService configService;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /** Reads from SystemConfig first, falls back to @Value from env. */
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

    public DeliveryResult send(String recipient, String message, String subject) {
        boolean enabled = resolveBoolean("integration.iletimerkezi.enabled", smsEnabled);
        if (!enabled) {
            logger.warn("İleti Merkezi SMS disabled — would send to {}: {}", recipient, message);
            return DeliveryResult.disabled("IletiMerkezi").withProvider("ILETIMERKEZI");
        }

        String key    = resolve("integration.iletimerkezi.key",      apiKey);
        String hash   = resolve("integration.iletimerkezi.hash",     apiHash);
        String sndr   = resolve("integration.iletimerkezi.sender",   sender);
        String iysVal = resolve("integration.iletimerkezi.iys",      iys);
        String iyLst  = resolve("integration.iletimerkezi.iys_list", iysList);

        if (key.isBlank() || hash.isBlank()) {
            logger.error("İleti Merkezi credentials not configured (ILETIMERKEZI_KEY / ILETIMERKEZI_HASH).");
            return DeliveryResult.failure("CONFIG_ERROR", "İleti Merkezi credentials not configured").withProvider("ILETIMERKEZI");
        }

        String normalizedNumber = normalizeToTurkishFormat(recipient);
        if (normalizedNumber == null) {
            logger.error("Cannot normalize phone number for İleti Merkezi: {}", recipient);
            return DeliveryResult.failure("INVALID_NUMBER", "Cannot normalize number: " + recipient).withProvider("ILETIMERKEZI");
        }

        String fullMessage = "[Hatirlat.io] " + subject + "\n" + message;

        try {
            URI uri = UriComponentsBuilder.fromHttpUrl(API_URL)
                    .queryParam("key",        key)
                    .queryParam("hash",       hash)
                    .queryParam("text",       fullMessage)
                    .queryParam("receipents", normalizedNumber)
                    .queryParam("sender",     sndr)
                    .queryParam("iys",        iysVal)
                    .queryParam("iysList",    iyLst)
                    .build(true)
                    .toUri();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(uri)
                    .timeout(Duration.ofSeconds(15))
                    .GET()
                    .build();

            logger.info("Sending SMS via İleti Merkezi to: {}", normalizedNumber);

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            String body = response.body() != null ? response.body().trim() : "";

            logger.debug("İleti Merkezi response: status={} body={}", response.statusCode(), body);

            if (response.statusCode() == 200) {
                String code = extractXmlValue(body, "code");
                String orderId = extractXmlValue(body, "id");

                if (isSuccessCode(code)) {
                    logger.info("İleti Merkezi SMS sent. orderId={} to={}", orderId, normalizedNumber);
                    return DeliveryResult.success(orderId, "sent",
                            "provider=iletimerkezi to=" + normalizedNumber + " orderId=" + orderId)
                            .withProvider("ILETIMERKEZI");
                } else {
                    String errorMsg = resolveIletiMerkeziError(code);
                    logger.error("İleti Merkezi SMS failed. code={} message={}", code, errorMsg);
                    return DeliveryResult.failure(code, errorMsg).withProvider("ILETIMERKEZI");
                }
            } else {
                logger.error("İleti Merkezi HTTP error: status={}", response.statusCode());
                return DeliveryResult.failure("HTTP_" + response.statusCode(), body).withProvider("ILETIMERKEZI");
            }

        } catch (Exception e) {
            logger.error("Failed to send SMS via İleti Merkezi to {}: {}", normalizedNumber, e.getMessage());
            return DeliveryResult.failure("NETWORK_ERROR", e.getMessage()).withProvider("ILETIMERKEZI");
        }
    }

    /**
     * Converts E.164 (+905XXXXXXXXX), local (05XXXXXXXXX) or short (5XXXXXXXXX)
     * to İleti Merkezi format: 5XXXXXXXXX (10 digits starting with 5).
     */
    private String normalizeToTurkishFormat(String phone) {
        if (phone == null) return null;
        String digits = phone.replaceAll("[^0-9]", "");

        if (digits.startsWith("90") && digits.length() == 12) {
            return digits.substring(2); // +905XXXXXXXXX → 5XXXXXXXXX
        } else if (digits.startsWith("0") && digits.length() == 11) {
            return digits.substring(1); // 05XXXXXXXXX → 5XXXXXXXXX
        } else if (digits.startsWith("5") && digits.length() == 10) {
            return digits; // already correct
        }
        return null;
    }

    private boolean isSuccessCode(String code) {
        return STATUS_SENDING.equals(code)
                || STATUS_SENT.equals(code)
                || STATUS_COMPLETED.equals(code)
                || STATUS_OK.equals(code);
    }

    /**
     * Extracts a tag value from a simple XML response.
     * e.g. extractXmlValue("<code>110</code>", "code") → "110"
     */
    private String extractXmlValue(String xml, String tag) {
        if (xml == null) return "";
        String open  = "<" + tag + ">";
        String close = "</" + tag + ">";
        int start = xml.indexOf(open);
        int end   = xml.indexOf(close);
        if (start < 0 || end < 0) return "";
        return xml.substring(start + open.length(), end).trim();
    }

    private String resolveIletiMerkeziError(String code) {
        if (code == null) return "Unknown error";
        return switch (code.trim()) {
            case "112" -> "Message transmission failed";
            case "115" -> "Order failed to send";
            case "400" -> "Request could not be parsed";
            case "401" -> "Invalid API key or hash (authentication failed)";
            case "402" -> "Insufficient account balance";
            case "404" -> "API method not available";
            case "422" -> "Validation error (check sender, recipients, IYS settings)";
            case "450" -> "Invalid sender name";
            case "451" -> "Message text is empty";
            case "452" -> "Invalid recipient numbers";
            case "460" -> "IYS list type missing or invalid";
            case "503" -> "Server temporarily unavailable";
            default    -> "İleti Merkezi error code: " + code;
        };
    }
}
