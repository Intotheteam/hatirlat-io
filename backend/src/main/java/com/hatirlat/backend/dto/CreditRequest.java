package com.hatirlat.backend.dto;

public class CreditRequest {
    private Integer amount;

    public CreditRequest() {
    }

    public CreditRequest(Integer amount) {
        this.amount = amount;
    }

    public Integer getAmount() {
        return amount;
    }

    public void setAmount(Integer amount) {
        this.amount = amount;
    }
}
