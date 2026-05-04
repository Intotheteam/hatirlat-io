package com.hatirlat.backend.dto;

/**
 * Admin payload for approving or rejecting a top-up request.
 */
public class TopUpReviewRequest {

    /** Optional note from admin (visible internally / to the user). */
    private String adminNote;

    /** Reason if rejecting; required for REJECTED action. */
    private String rejectionReason;

    /** Optional raw gateway response JSON to store for audit. */
    private String gatewayResponse;

    public String getAdminNote() { return adminNote; }
    public void setAdminNote(String adminNote) { this.adminNote = adminNote; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getGatewayResponse() { return gatewayResponse; }
    public void setGatewayResponse(String gatewayResponse) { this.gatewayResponse = gatewayResponse; }
}
