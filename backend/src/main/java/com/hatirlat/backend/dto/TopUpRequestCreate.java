package com.hatirlat.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * Payload from end-user to request a credit top-up.
 */
public class TopUpRequestCreate {

    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Amount must be at least 1")
    private Integer amount;

    private BigDecimal amountTry;

    private String currency;

    /** "BANK_TRANSFER", "CREDIT_CARD", "IYZICO", ... */
    private String paymentMethod;

    /** Reference for bank transfer, transaction ID, etc. */
    private String paymentReference;

    /** True if user already paid (e.g., transfer completed). */
    private boolean paymentDone;

    public Integer getAmount() { return amount; }
    public void setAmount(Integer amount) { this.amount = amount; }

    public BigDecimal getAmountTry() { return amountTry; }
    public void setAmountTry(BigDecimal amountTry) { this.amountTry = amountTry; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }

    public boolean isPaymentDone() { return paymentDone; }
    public void setPaymentDone(boolean paymentDone) { this.paymentDone = paymentDone; }
}
