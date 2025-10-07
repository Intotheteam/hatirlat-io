package com.hatirlat.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.List;

public class ReminderResponse {
    private String id;
    private String title;
    private String type; // "personal" | "group"
    private String message;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateTime;
    private String status; // "scheduled" | "sent" | "paused" | "failed"
    private ContactRequest contact;
    private GroupResponse group;
    private List<String> channels; // "email" | "sms" | "whatsapp"
    private String repeat; // "none" | "hourly" | "daily" | "weekly" | "custom"
    private CustomRepeatRequest customRepeat;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getDateTime() { return dateTime; }
    public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public ContactRequest getContact() { return contact; }
    public void setContact(ContactRequest contact) { this.contact = contact; }

    public GroupResponse getGroup() { return group; }
    public void setGroup(GroupResponse group) { this.group = group; }

    public List<String> getChannels() { return channels; }
    public void setChannels(List<String> channels) { this.channels = channels; }

    public String getRepeat() { return repeat; }
    public void setRepeat(String repeat) { this.repeat = repeat; }

    public CustomRepeatRequest getCustomRepeat() { return customRepeat; }
    public void setCustomRepeat(CustomRepeatRequest customRepeat) { this.customRepeat = customRepeat; }
}