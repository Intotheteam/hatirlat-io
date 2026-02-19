package com.hatirlat.backend.notification;

import com.hatirlat.backend.entity.NotificationChannel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Component
public class EmailNotificationStrategy implements NotificationStrategy {

    private static final Logger logger = LoggerFactory.getLogger(EmailNotificationStrategy.class);

    private final JavaMailSender mailSender;

    @Value("${mail.from:noreply@hatirlat.io}")
    private String fromAddress;

    public EmailNotificationStrategy(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public NotificationChannel getChannelType() {
        return NotificationChannel.EMAIL;
    }

    @Override
    public void sendNotification(String recipient, String message, String subject) {
        logger.info("Sending email to: {}, Subject: {}", recipient, subject);
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromAddress);
            helper.setTo(recipient);
            helper.setSubject("[Hatirlat.io] " + subject);
            helper.setText(buildHtmlContent(subject, message), true);

            mailSender.send(mimeMessage);
            logger.info("Email sent successfully to: {}", recipient);
        } catch (MessagingException e) {
            logger.error("Failed to send email to {}: {}", recipient, e.getMessage());
            throw new RuntimeException("Failed to send email notification", e);
        }
    }

    private String buildHtmlContent(String subject, String message) {
        return """
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; margin-bottom: 10px;">%s</h2>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
                    <p style="color: #555; line-height: 1.6; font-size: 16px;">%s</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        Bu e-posta Hatirlat.io tarafindan gonderilmistir.
                    </p>
                </div>
            </body>
            </html>
            """.formatted(subject, message);
    }
}
