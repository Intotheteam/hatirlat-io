package com.hatirlat.backend.notification;

import com.hatirlat.backend.entity.NotificationChannel;

public interface NotificationStrategy {
    NotificationChannel getChannelType();

    DeliveryResult sendNotification(String recipient, String message, String subject);
}