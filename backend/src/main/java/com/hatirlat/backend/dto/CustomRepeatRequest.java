package com.hatirlat.backend.dto;

import java.util.List;

public class CustomRepeatRequest {
    private Integer interval;
    private String frequency; // "day" | "week" | "month"
    private List<String> daysOfWeek; // ["mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"

    // Getters and Setters
    public Integer getInterval() { return interval; }
    public void setInterval(Integer interval) { this.interval = interval; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public List<String> getDaysOfWeek() { return daysOfWeek; }
    public void setDaysOfWeek(List<String> daysOfWeek) { this.daysOfWeek = daysOfWeek; }
}