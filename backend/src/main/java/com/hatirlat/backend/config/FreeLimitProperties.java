package com.hatirlat.backend.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "free-limit")
public class FreeLimitProperties {

    private int defaultMaxRequests = 10;
    private int defaultPerSeconds = 60;
    private Map<String, Rule> rules = new HashMap<>();

    public int getDefaultMaxRequests() {
        return defaultMaxRequests;
    }

    public void setDefaultMaxRequests(int defaultMaxRequests) {
        this.defaultMaxRequests = defaultMaxRequests;
    }

    public int getDefaultPerSeconds() {
        return defaultPerSeconds;
    }

    public void setDefaultPerSeconds(int defaultPerSeconds) {
        this.defaultPerSeconds = defaultPerSeconds;
    }

    public Map<String, Rule> getRules() {
        return rules;
    }

    public void setRules(Map<String, Rule> rules) {
        this.rules = rules;
    }

    public static class Rule {
        private int maxRequests;
        private int perSeconds;

        public int getMaxRequests() {
            return maxRequests;
        }

        public void setMaxRequests(int maxRequests) {
            this.maxRequests = maxRequests;
        }

        public int getPerSeconds() {
            return perSeconds;
        }

        public void setPerSeconds(int perSeconds) {
            this.perSeconds = perSeconds;
        }
    }
}

