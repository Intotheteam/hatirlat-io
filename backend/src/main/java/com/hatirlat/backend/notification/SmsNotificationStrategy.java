package com.hatirlat.backend.notification;

import com.hatirlat.backend.entity.NotificationChannel;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class SmsNotificationStrategy implements NotificationStrategy {

    private static final Logger logger = LoggerFactory.getLogger(SmsNotificationStrategy.class);

    @Value("${twilio.sms.from-number:}")
    private String fromNumber;

    @Value("${twilio.sms.enabled:false}")
    private boolean smsEnabled;

    @Override
    public NotificationChannel getChannelType() {
        return NotificationChannel.SMS;
    }

    @Override
    public DeliveryResult sendNotification(String recipient, String message, String subject) {
        if (!smsEnabled) {
            logger.warn("SMS disabled — would send to {}: {}", recipient, message);
            return DeliveryResult.disabled("SMS");
        }

        if (fromNumber.isBlank()) {
            logger.error("TWILIO_FROM_PHONE is not configured.");
            return DeliveryResult.failure("CONFIG_ERROR", "TWILIO_FROM_PHONE is not configured");
        }

        try {
            logger.info("Sending SMS to: {}", recipient);
            Message twilioMessage = Message.creator(
                    new PhoneNumber(recipient),
                    new PhoneNumber(fromNumber),
                    "[Hatirlat.io] " + subject + "\n" + message).create();

            String sid = twilioMessage.getSid();
            String status = twilioMessage.getStatus() != null ? twilioMessage.getStatus().toString() : "unknown";
            logger.info("SMS sent. SID={} Status={}", sid, status);
            return DeliveryResult.success(sid, status,
                    "to=" + recipient + " sid=" + sid + " status=" + status);

        } catch (com.twilio.exception.ApiException e) {
            logger.error("Twilio API error sending SMS to {}: code={} message={}", recipient, e.getCode(),
                    e.getMessage());
            return DeliveryResult.failure(String.valueOf(e.getCode()), e.getMessage());
        } catch (Exception e) {
            logger.error("Failed to send SMS to {}: {}", recipient, e.getMessage());
            return DeliveryResult.failure("UNKNOWN", e.getMessage());
        }
    }
}
