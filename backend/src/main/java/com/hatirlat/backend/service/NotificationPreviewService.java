package com.hatirlat.backend.service;

import com.hatirlat.backend.dto.MemberResponse;
import com.hatirlat.backend.dto.NotificationPreview;
import com.hatirlat.backend.entity.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Computes a "what will Send do" preview for a reminder without contacting any provider.
 * Mirrors NotificationService resolution logic: per-recipient single target (email-or-phone
 * fallback) shared across all channels.
 */
@Service
public class NotificationPreviewService {

    private final MemberService memberService;

    public NotificationPreviewService(MemberService memberService) {
        this.memberService = memberService;
    }

    @Transactional(readOnly = true)
    public NotificationPreview build(Reminder reminder) {
        List<NotificationChannel> channels = reminder.getChannels();
        List<NotificationPreview.Item> items = new ArrayList<>();
        int recipients = 0;
        int delivered = 0;
        int skipped = 0;

        if (channels == null || channels.isEmpty()) {
            return new NotificationPreview(
                    reminder.getId().toString(),
                    reminder.getTitle(),
                    0, 0, 0, 0,
                    items
            );
        }

        if (reminder.getGroup() != null) {
            List<MemberResponse> members = memberService.getGroupMembers(String.valueOf(reminder.getGroup().getId()));
            for (MemberResponse m : members) {
                recipients++;
                boolean inactive = "INACTIVE".equalsIgnoreCase(m.getStatus());
                String target = resolveMemberTarget(m);
                for (NotificationChannel ch : channels) {
                    String warn = null;
                    if (inactive) {
                        warn = "INACTIVE üye — atlanacak";
                        skipped++;
                    } else if (target == null) {
                        warn = "Üyenin email/telefonu yok — atlanacak";
                        skipped++;
                    } else {
                        delivered++;
                        warn = channelMismatchWarning(ch, target);
                    }
                    items.add(new NotificationPreview.Item(
                            m.getName(), "MEMBER", m.getStatus(),
                            ch.name(), target,
                            reminder.getTitle(), reminder.getMessage(),
                            warn
                    ));
                }
            }
        } else {
            recipients = 1;
            String target;
            String name;
            String type;
            String status = null;
            Contact contact = reminder.getContact();
            if (contact != null) {
                target = !isBlank(contact.getEmail()) ? contact.getEmail()
                        : (!isBlank(contact.getPhone()) ? contact.getPhone() : null);
                name = contact.getName() != null ? contact.getName() : "(Kayıtlı kişi)";
                type = "CONTACT";
            } else {
                User u = reminder.getUser();
                target = u != null ? u.getEmail() : null;
                name = u != null ? (u.getUsername() != null ? u.getUsername() : u.getEmail()) : "(Sahibi)";
                type = "USER";
            }
            for (NotificationChannel ch : channels) {
                String warn = target == null ? "Alıcı bilgisi yok — atlanacak"
                        : channelMismatchWarning(ch, target);
                if (target == null) skipped++; else delivered++;
                items.add(new NotificationPreview.Item(
                        name, type, status,
                        ch.name(), target,
                        reminder.getTitle(), reminder.getMessage(),
                        warn
                ));
            }
        }

        return new NotificationPreview(
                reminder.getId().toString(),
                reminder.getTitle(),
                recipients,
                channels.size(),
                delivered,
                skipped,
                items
        );
    }

    private String resolveMemberTarget(MemberResponse m) {
        if (!isBlank(m.getEmail())) return m.getEmail();
        if (!isBlank(m.getPhone())) return m.getPhone();
        return null;
    }

    /** If target looks like an email but channel is SMS/WHATSAPP (or vice versa), surface a warning. */
    private String channelMismatchWarning(NotificationChannel channel, String target) {
        if (target == null) return null;
        boolean looksEmail = target.contains("@");
        if (channel == NotificationChannel.EMAIL && !looksEmail) {
            return "Hedef email gibi görünmüyor; gönderim başarısız olabilir";
        }
        if ((channel == NotificationChannel.SMS || channel == NotificationChannel.WHATSAPP) && looksEmail) {
            return "Telefon yok; SMS/WhatsApp email adresine yönlenir ve büyük olasılıkla başarısız olur";
        }
        return null;
    }

    private boolean isBlank(String s) { return s == null || s.isBlank(); }
}
