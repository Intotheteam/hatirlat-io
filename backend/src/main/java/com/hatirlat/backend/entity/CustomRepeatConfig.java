package com.hatirlat.backend.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "custom_repeat_configs")
public class CustomRepeatConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "repeat_interval") // Renamed from 'interval' as it's a reserved keyword in H2
    private Integer interval; // e.g., every 2 days/weeks/months

    @Enumerated(EnumType.STRING)
    private RepeatFrequency frequency; // day, week, month

    @ElementCollection
    @CollectionTable(name = "custom_repeat_days", joinColumns = @JoinColumn(name = "config_id"))
    @Enumerated(EnumType.STRING)
    private List<DayOfWeek> daysOfWeek; // Days when frequency is "week"

    // Constructors
    public CustomRepeatConfig() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getInterval() {
        return interval;
    }

    public void setInterval(Integer interval) {
        this.interval = interval;
    }

    public RepeatFrequency getFrequency() {
        return frequency;
    }

    public void setFrequency(RepeatFrequency frequency) {
        this.frequency = frequency;
    }

    public List<DayOfWeek> getDaysOfWeek() {
        return daysOfWeek;
    }

    public void setDaysOfWeek(List<DayOfWeek> daysOfWeek) {
        this.daysOfWeek = daysOfWeek;
    }
}