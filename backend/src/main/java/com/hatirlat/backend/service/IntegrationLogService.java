package com.hatirlat.backend.service;

import com.hatirlat.backend.entity.*;
import com.hatirlat.backend.notification.DeliveryResult;
import com.hatirlat.backend.repository.IntegrationLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Logs every integration API call with calculated cost.
 * Costs are read from SystemConfig with hardcoded defaults.
 */
@Service
public class IntegrationLogService {

    private static final Logger logger = LoggerFactory.getLogger(IntegrationLogService.class);

    // Default costs per unit
    private static final Map<IntegrationProvider, BigDecimal> DEFAULT_COSTS = Map.of(
        IntegrationProvider.NETGSM,          new BigDecimal("0.080000"),  // TRY per SMS
        IntegrationProvider.ILETIMERKEZI,    new BigDecimal("0.070000"),  // TRY per SMS
        IntegrationProvider.TWILIO_SMS,       new BigDecimal("0.007900"),  // USD per SMS
        IntegrationProvider.TWILIO_WHATSAPP,  new BigDecimal("0.005000"),  // USD per message
        IntegrationProvider.SMTP,             new BigDecimal("0.000000")   // USD per email (free)
    );

    private static final Map<IntegrationProvider, String> CURRENCIES = Map.of(
        IntegrationProvider.NETGSM,          "TRY",
        IntegrationProvider.ILETIMERKEZI,    "TRY",
        IntegrationProvider.TWILIO_SMS,       "USD",
        IntegrationProvider.TWILIO_WHATSAPP,  "USD",
        IntegrationProvider.SMTP,             "USD"
    );

    @Autowired
    private IntegrationLogRepository repository;

    @Autowired
    private SystemConfigService configService;

    public void log(IntegrationProvider provider, NotificationChannel channel,
                    DeliveryResult result, Long userId, Long reminderId,
                    String recipient, long durationMs) {
        try {
            IntegrationLog log = new IntegrationLog();
            log.setProvider(provider);
            log.setChannel(channel);
            log.setDurationMs(durationMs);
            log.setUserId(userId);
            log.setReminderId(reminderId);
            log.setRecipientMasked(maskRecipient(recipient));

            boolean success = result != null && result.isSuccess();
            boolean disabled = result != null && "disabled".equals(result.getProviderStatus());

            if (disabled) {
                log.setStatus("DISABLED");
                log.setCostAmount(BigDecimal.ZERO);
            } else if (success) {
                log.setStatus("SUCCESS");
                log.setCostAmount(getCostPerUnit(provider));
                log.setProviderMessageId(result.getProviderMessageId());
            } else {
                log.setStatus("FAILED");
                log.setCostAmount(BigDecimal.ZERO);
                if (result != null) {
                    log.setErrorCode(result.getProviderErrorCode());
                    log.setErrorMessage(truncate(result.getProviderResponse(), 1000));
                }
            }

            log.setCostCurrency(CURRENCIES.getOrDefault(provider, "USD"));
            repository.save(log);
        } catch (Exception e) {
            logger.error("Failed to save integration log for provider {}: {}", provider, e.getMessage());
        }
    }

    private BigDecimal getCostPerUnit(IntegrationProvider provider) {
        // Try to read from SystemConfig first, fall back to defaults
        try {
            String key = "billing." + provider.name().toLowerCase().replace("_", ".") + ".cost_per_unit";
            String val = configService.getConfig(key);
            if (val != null && !val.isBlank()) {
                return new BigDecimal(val);
            }
        } catch (Exception ignored) {}
        return DEFAULT_COSTS.getOrDefault(provider, BigDecimal.ZERO);
    }

    private String maskRecipient(String recipient) {
        if (recipient == null || recipient.length() < 4) return "***";
        if (recipient.contains("@")) {
            // email: show first 2 chars + domain
            int at = recipient.indexOf('@');
            String local = recipient.substring(0, Math.min(2, at));
            return local + "***" + recipient.substring(at);
        }
        // phone: show last 4 digits
        return "***" + recipient.substring(Math.max(0, recipient.length() - 4));
    }

    private String truncate(String s, int max) {
        if (s == null) return null;
        return s.length() > max ? s.substring(0, max) : s;
    }
}
