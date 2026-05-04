package com.hatirlat.backend.service;

import com.hatirlat.backend.dto.TopUpRequestCreate;
import com.hatirlat.backend.dto.TopUpRequestResponse;
import com.hatirlat.backend.dto.TopUpReviewRequest;
import com.hatirlat.backend.entity.TopUpRequest;
import com.hatirlat.backend.entity.TopUpStatus;
import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.exception.ResourceNotFoundException;
import com.hatirlat.backend.repository.TopUpRequestRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TopUpService {

    private static final Logger logger = LoggerFactory.getLogger(TopUpService.class);

    @Autowired
    private TopUpRequestRepository topUpRepository;

    @Autowired
    private CreditService creditService;

    /** Submit a new top-up request from a user. */
    @Transactional
    public TopUpRequestResponse createRequest(User user, TopUpRequestCreate dto) {
        TopUpRequest req = new TopUpRequest();
        req.setUser(user);
        req.setAmount(dto.getAmount());
        req.setAmountTry(dto.getAmountTry());
        req.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "TRY");
        req.setPaymentMethod(dto.getPaymentMethod());
        req.setPaymentReference(dto.getPaymentReference());
        req.setPaymentDone(dto.isPaymentDone());
        req.setStatus(dto.isPaymentDone() ? TopUpStatus.PAID : TopUpStatus.PENDING);

        TopUpRequest saved = topUpRepository.save(req);
        logger.info("Top-up request created: id={} user={} amount={} status={}",
                saved.getId(), user.getUsername(), saved.getAmount(), saved.getStatus());
        return toDto(saved);
    }

    /** User flips paymentDone to true after completing payment. */
    @Transactional
    public TopUpRequestResponse markPaymentDone(Long requestId, User user, String reference) {
        TopUpRequest req = topUpRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("TopUpRequest", String.valueOf(requestId)));

        if (!req.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Bu talep size ait değil.");
        }
        if (req.getStatus() == TopUpStatus.APPROVED || req.getStatus() == TopUpStatus.REJECTED) {
            throw new IllegalStateException("Talep zaten kapatılmış (" + req.getStatus() + ").");
        }

        req.setPaymentDone(true);
        if (reference != null && !reference.isBlank()) {
            req.setPaymentReference(reference);
        }
        if (req.getStatus() == TopUpStatus.PENDING) {
            req.setStatus(TopUpStatus.PAID);
        }
        return toDto(topUpRepository.save(req));
    }

    public List<TopUpRequestResponse> listForUser(User user) {
        return topUpRepository.findByUserOrderByRequestedAtDesc(user).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    public Page<TopUpRequestResponse> listAll(Pageable pageable, TopUpStatus statusFilter) {
        Page<TopUpRequest> page = (statusFilter == null)
                ? topUpRepository.findAllByOrderByRequestedAtDesc(pageable)
                : topUpRepository.findByStatusOrderByRequestedAtDesc(statusFilter, pageable);
        return page.map(this::toDto);
    }

    public long pendingCount() {
        return topUpRepository.countByStatus(TopUpStatus.PENDING)
             + topUpRepository.countByStatus(TopUpStatus.PAID);
    }

    /** Admin approves: grants credits and marks APPROVED. */
    @Transactional
    public TopUpRequestResponse approve(Long requestId, User adminUser, TopUpReviewRequest review) {
        TopUpRequest req = topUpRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("TopUpRequest", String.valueOf(requestId)));

        if (req.getStatus() == TopUpStatus.APPROVED) {
            throw new IllegalStateException("Talep zaten onaylanmış.");
        }
        if (req.getStatus() == TopUpStatus.REJECTED) {
            throw new IllegalStateException("Reddedilmiş talep onaylanamaz.");
        }

        // Grant credits and log transaction
        creditService.addCredits(req.getUser(), req.getAmount(),
                "Top-up #" + req.getId() + " onayı (" + adminUser.getUsername() + ")");

        req.setStatus(TopUpStatus.APPROVED);
        req.setApprovedAt(LocalDateTime.now());
        req.setReviewedBy(adminUser.getUsername());
        if (review != null) {
            if (review.getAdminNote() != null) req.setAdminNote(review.getAdminNote());
            if (review.getGatewayResponse() != null) req.setGatewayResponse(review.getGatewayResponse());
        }

        TopUpRequest saved = topUpRepository.save(req);
        logger.info("Top-up #{} APPROVED by {} → +{} credits to user {}",
                saved.getId(), adminUser.getUsername(), saved.getAmount(), saved.getUser().getUsername());
        return toDto(saved);
    }

    /** Admin rejects with reason. No credits granted. */
    @Transactional
    public TopUpRequestResponse reject(Long requestId, User adminUser, TopUpReviewRequest review) {
        TopUpRequest req = topUpRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("TopUpRequest", String.valueOf(requestId)));

        if (req.getStatus() == TopUpStatus.APPROVED) {
            throw new IllegalStateException("Onaylanmış talep reddedilemez.");
        }
        if (review == null || review.getRejectionReason() == null || review.getRejectionReason().isBlank()) {
            throw new IllegalArgumentException("Reddetme sebebi zorunludur.");
        }

        req.setStatus(TopUpStatus.REJECTED);
        req.setApprovedAt(LocalDateTime.now()); // reviewedAt
        req.setReviewedBy(adminUser.getUsername());
        req.setRejectionReason(review.getRejectionReason());
        if (review.getAdminNote() != null) req.setAdminNote(review.getAdminNote());
        if (review.getGatewayResponse() != null) req.setGatewayResponse(review.getGatewayResponse());

        TopUpRequest saved = topUpRepository.save(req);
        logger.info("Top-up #{} REJECTED by {} reason='{}'",
                saved.getId(), adminUser.getUsername(), saved.getRejectionReason());
        return toDto(saved);
    }

    private TopUpRequestResponse toDto(TopUpRequest req) {
        TopUpRequestResponse r = new TopUpRequestResponse();
        r.setId(req.getId());
        if (req.getUser() != null) {
            r.setUserId(req.getUser().getId());
            r.setUsername(req.getUser().getUsername());
            r.setUserEmail(req.getUser().getEmail());
        }
        r.setAmount(req.getAmount());
        r.setAmountTry(req.getAmountTry());
        r.setCurrency(req.getCurrency());
        r.setPaymentMethod(req.getPaymentMethod());
        r.setPaymentReference(req.getPaymentReference());
        r.setPaymentDone(req.isPaymentDone());
        r.setGatewayResponse(req.getGatewayResponse());
        r.setStatus(req.getStatus() != null ? req.getStatus().name() : null);
        r.setRejectionReason(req.getRejectionReason());
        r.setAdminNote(req.getAdminNote());
        r.setReviewedBy(req.getReviewedBy());
        r.setRequestedAt(req.getRequestedAt());
        r.setApprovedAt(req.getApprovedAt());
        return r;
    }
}
