package com.hatirlat.backend.notification;

import com.hatirlat.backend.entity.NotificationChannel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * SMS routing strategy:
 *   - Turkish numbers (+90 / 05xx / 5xx) → Netgsm
 *   - All other numbers                  → Twilio
 */
@Component
public class SmsNotificationStrategy implements NotificationStrategy {

    private static final Logger logger = LoggerFactory.getLogger(SmsNotificationStrategy.class);

    private final NetgsmSmsStrategy netgsm;
    private final TwilioSmsStrategy twilio;

    public SmsNotificationStrategy(NetgsmSmsStrategy netgsm, TwilioSmsStrategy twilio) {
        this.netgsm = netgsm;
        this.twilio = twilio;
    }

    @Override
    public NotificationChannel getChannelType() {
        return NotificationChannel.SMS;
    }

    @Override
    public DeliveryResult sendNotification(String recipient, String message, String subject) {
        if (isTurkishNumber(recipient)) {
            logger.info("Routing SMS to Netgsm (TR number): {}", recipient);
            return netgsm.send(recipient, message, subject);
        } else {
            logger.info("Routing SMS to Twilio (international number): {}", recipient);
            return twilio.send(recipient, message, subject);
        }
    }

    /**
     * Returns true for Turkish numbers in any common format:
     *   +905XXXXXXXXX, 00905XXXXXXXXX, 05XXXXXXXXX, 5XXXXXXXXX
     */
    private boolean isTurkishNumber(String phone) {
        if (phone == null) return false;
        String digits = phone.replaceAll("[^0-9]", "");
        return digits.startsWith("90")   // +90... or 0090...
            || digits.startsWith("05")   // 05XXXXXXXXX
            || (digits.startsWith("5") && digits.length() == 10); // 5XXXXXXXXX
    }
}
