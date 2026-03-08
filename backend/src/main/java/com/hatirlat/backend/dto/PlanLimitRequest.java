package com.hatirlat.backend.dto;

public class PlanLimitRequest {
    /** Numeric cap value. Use -1 for "unlimited". */
    private int intValue;
    /** Bool flag (for on/off rules like hourly_repeat_allowed). */
    private boolean boolValue;
    /** Optional description update. */
    private String description;

    public int getIntValue() {
        return intValue;
    }

    public boolean isBoolValue() {
        return boolValue;
    }

    public String getDescription() {
        return description;
    }

    public void setIntValue(int intValue) {
        this.intValue = intValue;
    }

    public void setBoolValue(boolean boolValue) {
        this.boolValue = boolValue;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
