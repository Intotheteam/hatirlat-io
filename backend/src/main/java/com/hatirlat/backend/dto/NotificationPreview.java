package com.hatirlat.backend.dto;

import java.util.List;

/**
 * What "Send" would actually do for a reminder, computed without contacting any provider.
 * Mirrors NotificationService recipient-resolution logic so the preview matches reality.
 */
public class NotificationPreview {

    public static class Item {
        private String recipientName;
        private String recipientType; // USER | CONTACT | MEMBER
        private String recipientStatus; // ACTIVE | INACTIVE | null
        private String channel;          // EMAIL | SMS | WHATSAPP
        private String target;           // resolved email or phone
        private String subject;
        private String message;
        private String warning;          // e.g., "INACTIVE - atlanacak", "Telefon yok ama SMS seçili"

        public Item() {}

        public Item(String recipientName, String recipientType, String recipientStatus,
                String channel, String target, String subject, String message, String warning) {
            this.recipientName = recipientName;
            this.recipientType = recipientType;
            this.recipientStatus = recipientStatus;
            this.channel = channel;
            this.target = target;
            this.subject = subject;
            this.message = message;
            this.warning = warning;
        }

        public String getRecipientName() { return recipientName; }
        public void setRecipientName(String recipientName) { this.recipientName = recipientName; }
        public String getRecipientType() { return recipientType; }
        public void setRecipientType(String recipientType) { this.recipientType = recipientType; }
        public String getRecipientStatus() { return recipientStatus; }
        public void setRecipientStatus(String recipientStatus) { this.recipientStatus = recipientStatus; }
        public String getChannel() { return channel; }
        public void setChannel(String channel) { this.channel = channel; }
        public String getTarget() { return target; }
        public void setTarget(String target) { this.target = target; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getWarning() { return warning; }
        public void setWarning(String warning) { this.warning = warning; }
    }

    private String reminderId;
    private String reminderTitle;
    private int recipientCount;
    private int channelCount;
    private int deliveryCount;   // recipients * channels actually dispatched
    private int skippedCount;    // delivery attempts skipped (inactive / no contact / etc.)
    private List<Item> items;

    public NotificationPreview() {}

    public NotificationPreview(String reminderId, String reminderTitle, int recipientCount, int channelCount,
            int deliveryCount, int skippedCount, List<Item> items) {
        this.reminderId = reminderId;
        this.reminderTitle = reminderTitle;
        this.recipientCount = recipientCount;
        this.channelCount = channelCount;
        this.deliveryCount = deliveryCount;
        this.skippedCount = skippedCount;
        this.items = items;
    }

    public String getReminderId() { return reminderId; }
    public void setReminderId(String reminderId) { this.reminderId = reminderId; }
    public String getReminderTitle() { return reminderTitle; }
    public void setReminderTitle(String reminderTitle) { this.reminderTitle = reminderTitle; }
    public int getRecipientCount() { return recipientCount; }
    public void setRecipientCount(int recipientCount) { this.recipientCount = recipientCount; }
    public int getChannelCount() { return channelCount; }
    public void setChannelCount(int channelCount) { this.channelCount = channelCount; }
    public int getDeliveryCount() { return deliveryCount; }
    public void setDeliveryCount(int deliveryCount) { this.deliveryCount = deliveryCount; }
    public int getSkippedCount() { return skippedCount; }
    public void setSkippedCount(int skippedCount) { this.skippedCount = skippedCount; }
    public List<Item> getItems() { return items; }
    public void setItems(List<Item> items) { this.items = items; }
}
