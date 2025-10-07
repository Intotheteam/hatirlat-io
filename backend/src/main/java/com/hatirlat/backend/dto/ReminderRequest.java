package com.hatirlat.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;

public class ReminderRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Type is required")
    private String type; // "personal" | "group"

    private String message;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @NotNull(message = "Date and time is required")
    private LocalDateTime dateTime;

    @NotBlank(message = "Status is required")
    private String status; // "scheduled" | "sent" | "paused" | "failed"

    private ContactRequest contact;

    private GroupRequest group; // For new group creation (when type is group)
    private String groupId;    // For referencing existing group

    @NotEmpty(message = "At least one channel must be selected")
    private List<String> channels; // "email" | "sms" | "whatsapp"

    @NotBlank(message = "Repeat type is required")
    private String repeat; // "none" | "hourly" | "daily" | "weekly" | "custom"

    private CustomRepeatRequest customRepeat;

    // Getters and Setters
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

    public GroupRequest getGroup() { return group; }
    public void setGroup(GroupRequest group) { this.group = group; }

    public String getGroupId() { return groupId; }
    public void setGroupId(String groupId) { this.groupId = groupId; }

    public List<String> getChannels() { return channels; }
    public void setChannels(List<String> channels) { this.channels = channels; }

    public String getRepeat() { return repeat; }
    public void setRepeat(String repeat) { this.repeat = repeat; }

    public CustomRepeatRequest getCustomRepeat() { return customRepeat; }
    public void setCustomRepeat(CustomRepeatRequest customRepeat) { this.customRepeat = customRepeat; }
}