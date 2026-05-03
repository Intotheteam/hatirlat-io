package com.hatirlat.backend.entity;

/**
 * Types of system configuration entries
 */
public enum ConfigType {
    /**
     * API keys and credentials (e.g., Twilio, SMTP)
     * These should always be encrypted
     */
    API_KEY,

    /**
     * Feature flags to enable/disable functionality
     * (e.g., whatsapp.enabled, sms.enabled)
     */
    FEATURE_FLAG,

    /**
     * Message templates for notifications
     * (e.g., sms.template, email.template)
     */
    TEXT_TEMPLATE,

    /**
     * Plan limits and quotas
     * (e.g., free.daily_limit, premium.daily_limit)
     */
    PLAN_LIMIT,

    /**
     * General application settings
     */
    GENERAL
}
