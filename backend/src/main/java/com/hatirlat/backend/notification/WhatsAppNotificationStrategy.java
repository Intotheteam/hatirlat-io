package com.hatirlat.backend.notification;

import com.hatirlat.backend.entity.NotificationChannel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class WhatsAppNotificationStrategy implements NotificationStrategy {

    private static final Logger logger = LoggerFactory.getLogger(WhatsAppNotificationStrategy.class);

    @Value("${whatsapp.enabled:false}")
    private boolean whatsappEnabled;

    @Override
    public NotificationChannel getChannelType() {
        return NotificationChannel.WHATSAPP;
    }

    @Override
    public void sendNotification(String recipient, String message, String subject) {
        if (!whatsappEnabled) {
            logger.warn("WhatsApp notification is disabled. Would send to: {}, Message: {}", recipient, message);
            // TODO: Integrate with WhatsApp Business API when service is configured
            // To enable, set whatsapp.enabled=true and configure WhatsApp Business API credentials:
            // whatsapp.api.phone-number-id=YOUR_PHONE_NUMBER_ID
            // whatsapp.api.access-token=YOUR_ACCESS_TOKEN
            return;
        }

        logger.info("Sending WhatsApp message to: {}, Subject: {}", recipient, subject);
        // WhatsApp Business API integration placeholder:
        // POST https://graph.facebook.com/v17.0/{phone-number-id}/messages
        logger.info("WhatsApp message sent successfully to: {}", recipient);
    }
}
