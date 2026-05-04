package com.hatirlat.backend.entity;

/**
 * Lifecycle status of a credit top-up request.
 *
 *   PENDING   – user submitted the request, awaiting admin review
 *   PAID      – user marked payment as completed (or gateway confirmed); awaiting admin verification
 *   APPROVED  – admin approved; credits granted to user
 *   REJECTED  – admin rejected the request (rejectionReason is set)
 *   FAILED    – payment gateway returned a failure
 */
public enum TopUpStatus {
    PENDING,
    PAID,
    APPROVED,
    REJECTED,
    FAILED
}
