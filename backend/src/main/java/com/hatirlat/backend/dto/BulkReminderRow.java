package com.hatirlat.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

/**
 * One row in a CSV/JSON bulk reminder import.
 *
 * targetType drives where the reminder is sent:
 *  - PERSONAL: no contact/group; only the owner is notified
 *  - GROUP: groupName is looked up among the user's groups
 *  - CONTACT: contactEmail/Name/Phone are used to create or reuse a Contact
 */
public class BulkReminderRow {

    @NotBlank
    private String title;

    private String message;

    @NotNull
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateTime;

    /** PERSONAL | GROUP | CONTACT */
    @NotBlank
    private String targetType;

    /** Required when targetType=GROUP */
    private String groupName;

    /** Required when targetType=CONTACT */
    private String contactEmail;
    private String contactName;
    private String contactPhone;

    /** EMAIL, SMS, WHATSAPP — comma- or pipe-separated in CSV */
    private List<String> channels;

    /** none | hourly | daily | weekly | custom */
    private String repeat;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public LocalDateTime getDateTime() { return dateTime; }
    public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }
    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }
    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public List<String> getChannels() { return channels; }
    public void setChannels(List<String> channels) { this.channels = channels; }
    public String getRepeat() { return repeat; }
    public void setRepeat(String repeat) { this.repeat = repeat; }
}
