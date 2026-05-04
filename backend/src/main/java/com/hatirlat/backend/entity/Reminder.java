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

    /** Original start date (the first scheduled fire time). dateTime advances; startDate is fixed. */
    @Column(name = "start_date")
    private LocalDateTime startDate;

    /** Optional end date. When set on a recurring reminder, scheduler stops after this date. Null = no end. */
    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    private ReminderStatus status; // Enum for "scheduled", "sent", "paused", "failed"
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id", referencedColumnName = "id")
    private Contact contact;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", referencedColumnName = "id")
    private Group group;
    
    @ElementCollection
    @CollectionTable(name = "reminder_channels", joinColumns = @JoinColumn(name = "reminder_id"))
    @Enumerated(EnumType.STRING)
    private List<NotificationChannel> channels; // Enum for "email", "sms", "whatsapp"
    
    @Enumerated(EnumType.STRING)
    private RepeatType repeat; // Enum for "none", "hourly", "daily", "weekly", "custom"
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "custom_repeat_id", referencedColumnName = "id")
    private CustomRepeatConfig customRepeatConfig;

    // Constructors
    public Reminder() {}

    // Additional constructor for common use cases
    public Reminder(String title, ReminderType type, String message, LocalDateTime dateTime, 
                   ReminderStatus status, List<NotificationChannel> channels, RepeatType repeat) {
        this.title = title;
        this.type = type;
        this.message = message;
        this.dateTime = dateTime;
        this.status = status;
        this.channels = channels;
        this.repeat = repeat;
    }

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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Contact getContact() {
        return contact;
    }

    public void setContact(Contact contact) {
        this.contact = contact;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
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

    public CustomRepeatConfig getCustomRepeatConfig() {
        return customRepeatConfig;
    }

    public void setCustomRepeatConfig(CustomRepeatConfig customRepeatConfig) {
        this.customRepeatConfig = customRepeatConfig;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }
}