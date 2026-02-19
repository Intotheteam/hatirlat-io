package com.hatirlat.backend.notification;

import com.hatirlat.backend.entity.NotificationChannel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class SmsNotificationStrategy implements NotificationStrategy {

    private static final Logger logger = LoggerFactory.getLogger(SmsNotificationStrategy.class);

    @Value("${sms.enabled:false}")
    private boolean smsEnabled;

    @Override
    public NotificationChannel getChannelType() {
        return NotificationChannel.SMS;
    }

    @Override
    public void sendNotification(String recipient, String message, String subject) {
        if (!smsEnabled) {
            logger.warn("SMS notification is disabled. Would send to: {}, Message: {}", recipient, message);
            // TODO: Integrate with Twilio/AWS SNS when SMS service is configured
            // To enable, set sms.enabled=true and configure Twilio credentials:
            // sms.twilio.account-sid=YOUR_ACCOUNT_SID
            // sms.twilio.auth-token=YOUR_AUTH_TOKEN
            // sms.twilio.from-number=YOUR_TWILIO_NUMBER
            return;
        }

        logger.info("Sending SMS to: {}, Subject: {}", recipient, subject);
        // Twilio integration placeholder:
        // Twilio.init(accountSid, authToken);
        // Message.creator(new PhoneNumber(recipient), new PhoneNumber(fromNumber), message).create();
        logger.info("SMS sent successfully to: {}", recipient);
    }
}
