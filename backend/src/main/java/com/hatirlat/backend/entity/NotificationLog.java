package com.hatirlat.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification_logs")
public class NotificationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reminder_id")
    private Reminder reminder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private NotificationChannel channel;

    private String recipient;

    @Enumerated(EnumType.STRING)
    private NotificationLogStatus status; // SUCCESS, FAILED

    private String errorMessage;

    private LocalDateTime sentAt;

    // Constructors
    public NotificationLog() {}

    public NotificationLog(Reminder reminder, User user, NotificationChannel channel,
                           String recipient, NotificationLogStatus status, LocalDateTime sentAt) {
        this.reminder = reminder;
        this.user = user;
        this.channel = channel;
        this.recipient = recipient;
        this.status = status;
        this.sentAt = sentAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Reminder getReminder() { return reminder; }
    public void setReminder(Reminder reminder) { this.reminder = reminder; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public NotificationChannel getChannel() { return channel; }
    public void setChannel(NotificationChannel channel) { this.channel = channel; }

    public String getRecipient() { return recipient; }
    public void setRecipient(String recipient) { this.recipient = recipient; }

    public NotificationLogStatus getStatus() { return status; }
    public void setStatus(NotificationLogStatus status) { this.status = status; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
}
