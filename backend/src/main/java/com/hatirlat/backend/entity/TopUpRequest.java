package com.hatirlat.backend.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * A user-initiated request to top up credits, requiring admin approval.
 * On approval, credits are added to the user's account via CreditService.addCredits().
 */
@Entity
@Table(name = "topup_requests")
public class TopUpRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Number of credits requested. */
    @Column(nullable = false)
    private Integer amount;

    /** Cost in TRY (or selected currency); informational. */
    @Column(name = "amount_try", precision = 12, scale = 2)
    private BigDecimal amountTry;

    @Column(length = 8)
    private String currency;

    /** e.g., "BANK_TRANSFER", "CREDIT_CARD", "IYZICO". */
    @Column(name = "payment_method", length = 32)
    private String paymentMethod;

    /** User-provided reference (transfer ID, transaction code). */
    @Column(name = "payment_reference", length = 128)
    private String paymentReference;

    /** Whether the user marked payment as completed. */
    @Column(name = "payment_done", nullable = false)
    private boolean paymentDone = false;

    /** Raw JSON response from the payment gateway (if any). */
    @Lob
    @Column(name = "gateway_response", columnDefinition = "TEXT")
    private String gatewayResponse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private TopUpStatus status = TopUpStatus.PENDING;

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    /** Username of the admin who approved/rejected (auditing). */
    @Column(name = "reviewed_by", length = 64)
    private String reviewedBy;

    @Column(name = "rejection_reason", length = 512)
    private String rejectionReason;

    @Column(name = "admin_note", length = 512)
    private String adminNote;

    @PrePersist
    protected void onCreate() {
        if (requestedAt == null) {
            requestedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = TopUpStatus.PENDING;
        }
    }

    public TopUpRequest() {}

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

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

    public String getGatewayResponse() { return gatewayResponse; }
    public void setGatewayResponse(String gatewayResponse) { this.gatewayResponse = gatewayResponse; }

    public TopUpStatus getStatus() { return status; }
    public void setStatus(TopUpStatus status) { this.status = status; }

    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getAdminNote() { return adminNote; }
    public void setAdminNote(String adminNote) { this.adminNote = adminNote; }
}
