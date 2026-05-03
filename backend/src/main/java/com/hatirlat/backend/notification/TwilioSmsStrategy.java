package com.hatirlat.backend.notification;

import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Sends SMS via Twilio — used for international numbers (non-TR).
 */
@Component
public class TwilioSmsStrategy {

    private static final Logger logger = LoggerFactory.getLogger(TwilioSmsStrategy.class);

    @Value("${twilio.sms.from-number:}")
    private String fromNumber;

    @Value("${twilio.sms.enabled:false}")
    private boolean smsEnabled;

    public DeliveryResult send(String recipient, String message, String subject) {
        if (!smsEnabled) {
            logger.warn("Twilio SMS disabled — would send to {}: {}", recipient, message);
            return DeliveryResult.disabled("TwilioSMS").withProvider("TWILIO_SMS");
        }

        if (fromNumber.isBlank()) {
            logger.error("TWILIO_FROM_PHONE is not configured.");
            return DeliveryResult.failure("CONFIG_ERROR", "TWILIO_FROM_PHONE is not configured").withProvider("TWILIO_SMS");
        }

        try {
            logger.info("Sending SMS via Twilio to: {}", recipient);
            Message twilioMessage = Message.creator(
                    new PhoneNumber(recipient),
                    new PhoneNumber(fromNumber),
                    "[Hatirlat.io] " + subject + "\n" + message).create();

            String sid = twilioMessage.getSid();
            String status = twilioMessage.getStatus() != null ? twilioMessage.getStatus().toString() : "unknown";
            logger.info("Twilio SMS sent. SID={} Status={}", sid, status);
            return DeliveryResult.success(sid, status,
                    "provider=twilio to=" + recipient + " sid=" + sid + " status=" + status).withProvider("TWILIO_SMS");

        } catch (com.twilio.exception.ApiException e) {
            logger.error("Twilio API error sending SMS to {}: code={} message={}", recipient, e.getCode(), e.getMessage());
            return DeliveryResult.failure(String.valueOf(e.getCode()), e.getMessage()).withProvider("TWILIO_SMS");
        } catch (Exception e) {
            logger.error("Failed to send SMS via Twilio to {}: {}", recipient, e.getMessage());
            return DeliveryResult.failure("UNKNOWN", e.getMessage()).withProvider("TWILIO_SMS");
        }
    }
}
