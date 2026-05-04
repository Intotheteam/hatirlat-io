package com.hatirlat.backend.service;

import com.hatirlat.backend.entity.Reminder;
import com.hatirlat.backend.entity.RepeatType;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

/**
 * Builds RFC 5545 iCalendar (VCALENDAR/VEVENT) text for a reminder.
 * Maps RepeatType to RRULE for HOURLY/DAILY/WEEKLY. CUSTOM and NONE produce a single VEVENT (no RRULE).
 */
@Service
public class IcsService {

    private static final DateTimeFormatter ICS_UTC = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'");

    public String build(Reminder reminder) {
        LocalDateTime start = reminder.getStartDate() != null ? reminder.getStartDate() : reminder.getDateTime();
        LocalDateTime end = start != null ? start.plusMinutes(30) : LocalDateTime.now();
        LocalDateTime now = LocalDateTime.now();

        String uid = "reminder-" + reminder.getId() + "@hatirlat.io";
        String summary = escape(reminder.getTitle() != null ? reminder.getTitle() : "Reminder");
        String description = escape(reminder.getMessage() != null ? reminder.getMessage() : "");

        StringBuilder sb = new StringBuilder();
        sb.append("BEGIN:VCALENDAR\r\n");
        sb.append("VERSION:2.0\r\n");
        sb.append("PRODID:-//Hatirlat.io//EN\r\n");
        sb.append("CALSCALE:GREGORIAN\r\n");
        sb.append("METHOD:PUBLISH\r\n");
        sb.append("BEGIN:VEVENT\r\n");
        sb.append("UID:").append(uid).append("\r\n");
        sb.append("DTSTAMP:").append(toUtc(now)).append("\r\n");
        if (start != null) {
            sb.append("DTSTART:").append(toUtc(start)).append("\r\n");
            sb.append("DTEND:").append(toUtc(end)).append("\r\n");
        }
        sb.append("SUMMARY:").append(summary).append("\r\n");
        if (!description.isEmpty()) {
            sb.append("DESCRIPTION:").append(description).append("\r\n");
        }

        String rrule = buildRRule(reminder);
        if (rrule != null) {
            sb.append(rrule).append("\r\n");
        }

        sb.append("END:VEVENT\r\n");
        sb.append("END:VCALENDAR\r\n");
        return sb.toString();
    }

    private String buildRRule(Reminder reminder) {
        RepeatType repeat = reminder.getRepeat();
        if (repeat == null || repeat == RepeatType.NONE || repeat == RepeatType.CUSTOM) {
            return null;
        }
        StringBuilder rule = new StringBuilder("RRULE:FREQ=");
        switch (repeat) {
            case HOURLY:
                rule.append("HOURLY");
                break;
            case DAILY:
                rule.append("DAILY");
                break;
            case WEEKLY:
                rule.append("WEEKLY");
                break;
            default:
                return null;
        }
        if (reminder.getEndDate() != null) {
            rule.append(";UNTIL=").append(toUtc(reminder.getEndDate()));
        }
        return rule.toString();
    }

    private String toUtc(LocalDateTime dt) {
        return dt.atZone(ZoneOffset.systemDefault()).withZoneSameInstant(ZoneOffset.UTC).format(ICS_UTC);
    }

    /** Escape per RFC 5545: backslash, comma, semicolon, and newline. */
    private String escape(String s) {
        return s.replace("\\", "\\\\")
                .replace(";", "\\;")
                .replace(",", "\\,")
                .replace("\n", "\\n")
                .replace("\r", "");
    }
}
