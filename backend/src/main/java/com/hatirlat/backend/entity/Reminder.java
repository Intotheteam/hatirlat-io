package com.hatirlat.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "reminders")
public class Reminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    
    @Enumerated(EnumType.STRING)
    private ReminderType type; // Enum for "personal" or "group"
    
    private String message;
    
    private LocalDateTime dateTime;
    
    @Enumerated(EnumType.STRING)
    private ReminderStatus status; // Enum for "scheduled", "sent", "paused", "failed"
    
    private Long contactId; // Foreign key reference instead of relationship
    
    private Long groupId; // Foreign key reference instead of relationship
    
    @ElementCollection
    @CollectionTable(name = "reminder_channels", joinColumns = @JoinColumn(name = "reminder_id"))
    @Enumerated(EnumType.STRING)
    private List<NotificationChannel> channels; // Enum for "email", "sms", "whatsapp"
    
    @Enumerated(EnumType.STRING)
    private RepeatType repeat; // Enum for "none", "hourly", "daily", "weekly", "custom"
    
    private Long customRepeatId; // Foreign key reference instead of relationship

    // Constructors
    public Reminder() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public ReminderType getType() {
        return type;
    }

    public void setType(ReminderType type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    public ReminderStatus getStatus() {
        return status;
    }

    public void setStatus(ReminderStatus status) {
        this.status = status;
    }

    public Long getContactId() {
        return contactId;
    }

    public void setContactId(Long contactId) {
        this.contactId = contactId;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public List<NotificationChannel> getChannels() {
        return channels;
    }

    public void setChannels(List<NotificationChannel> channels) {
        this.channels = channels;
    }

    public RepeatType getRepeat() {
        return repeat;
    }

    public void setRepeat(RepeatType repeat) {
        this.repeat = repeat;
    }

    public Long getCustomRepeatId() {
        return customRepeatId;
    }

    public void setCustomRepeatId(Long customRepeatId) {
        this.customRepeatId = customRepeatId;
    }
}