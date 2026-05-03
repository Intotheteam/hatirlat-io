package com.hatirlat.backend.notification;

import com.hatirlat.backend.entity.NotificationChannel;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Recipient format : whatsapp:+905xxxxxxxxx (prefix added automatically if
 * missing)
 * From number : whatsapp:+14155238886 (Sandbox default) or approved number
 */
@Component
public class WhatsAppNotificationStrategy implements NotificationStrategy {

    private static final Logger logger = LoggerFactory.getLogger(WhatsAppNotificationStrategy.class);

    @Value("${twilio.whatsapp.from-number:whatsapp:+14155238886}")
    private String fromWhatsApp;

    @Value("${twilio.whatsapp.enabled:false}")
    private boolean whatsappEnabled;

    @Override
    public NotificationChannel getChannelType() {
        return NotificationChannel.WHATSAPP;
    }

    @Override
    public DeliveryResult sendNotification(String recipient, String message, String subject) {
        if (!whatsappEnabled) {
            logger.warn("WhatsApp disabled — would send to {}: {}", recipient, message);
            return DeliveryResult.disabled("WhatsApp").withProvider("TWILIO_WHATSAPP");
        }

        String to = recipient.startsWith("whatsapp:") ? recipient : "whatsapp:" + recipient;

        try {
            logger.info("Sending WhatsApp message to: {}", to);
            Message twilioMessage = Message.creator(
                    new PhoneNumber(to),
                    new PhoneNumber(fromWhatsApp),
                    "*[Hatirlat.io]* " + subject + "\n" + message).create();

            String sid = twilioMessage.getSid();
            String status = twilioMessage.getStatus() != null ? twilioMessage.getStatus().toString() : "unknown";
            logger.info("WhatsApp sent. SID={} Status={}", sid, status);
            return DeliveryResult.success(sid, status,
                    "to=" + to + " sid=" + sid + " status=" + status).withProvider("TWILIO_WHATSAPP");

        } catch (com.twilio.exception.ApiException e) {
            logger.error("Twilio API error sending WhatsApp to {}: code={} message={}", to, e.getCode(),
                    e.getMessage());
            return DeliveryResult.failure(String.valueOf(e.getCode()), e.getMessage()).withProvider("TWILIO_WHATSAPP");
        } catch (Exception e) {
            logger.error("Failed to send WhatsApp to {}: {}", to, e.getMessage());
            return DeliveryResult.failure("UNKNOWN", e.getMessage()).withProvider("TWILIO_WHATSAPP");
        }
    }
}
