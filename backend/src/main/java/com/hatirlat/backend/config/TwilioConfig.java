package com.hatirlat.backend.config;

import com.twilio.Twilio;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Centralized Twilio SDK initialization.
 * Initializes once on startup if either SMS or WhatsApp is enabled.
 */
@Configuration
public class TwilioConfig {

    private static final Logger logger = LoggerFactory.getLogger(TwilioConfig.class);

    @Value("${twilio.account-sid:}")
    private String accountSid;

    @Value("${twilio.auth-token:}")
    private String authToken;

    @Value("${twilio.sms.enabled:false}")
    private boolean smsEnabled;

    @Value("${twilio.whatsapp.enabled:false}")
    private boolean whatsappEnabled;

    @PostConstruct
    public void init() {
        boolean anyEnabled = smsEnabled || whatsappEnabled;
        if (!anyEnabled) {
            logger.info(
                    "Twilio is disabled (TWILIO_SMS_ENABLED and TWILIO_WHATSAPP_ENABLED are both false). Skipping initialization.");
            return;
        }

        if (accountSid.isBlank() || authToken.isBlank()) {
            logger.warn("Twilio is enabled but credentials are missing. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.");
            return;
        }

        Twilio.init(accountSid, authToken);
        logger.info("Twilio SDK initialized. accountSid={}, smsEnabled={}, whatsappEnabled={}",
                accountSid, smsEnabled, whatsappEnabled);
    }
}
