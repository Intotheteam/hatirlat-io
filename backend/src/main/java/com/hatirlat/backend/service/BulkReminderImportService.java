package com.hatirlat.backend.service;

import com.hatirlat.backend.dto.BulkImportRequest;
import com.hatirlat.backend.dto.BulkImportResult;
import com.hatirlat.backend.dto.BulkReminderRow;
import com.hatirlat.backend.dto.ContactRequest;
import com.hatirlat.backend.dto.ReminderRequest;
import com.hatirlat.backend.dto.ReminderResponse;
import com.hatirlat.backend.entity.Group;
import com.hatirlat.backend.entity.User;
import com.hatirlat.backend.repository.GroupRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Bulk import of reminders from a parsed list of rows. Each row is processed in its own
 * transaction (via ReminderService.createReminder) so a single bad row does not roll back
 * the rest. Returns a per-row success/error report.
 */
@Service
public class BulkReminderImportService {

    private static final Logger logger = LoggerFactory.getLogger(BulkReminderImportService.class);

    private final ReminderService reminderService;
    private final GroupRepository groupRepository;

    public BulkReminderImportService(ReminderService reminderService, GroupRepository groupRepository) {
        this.reminderService = reminderService;
        this.groupRepository = groupRepository;
    }

    public BulkImportResult importRows(BulkImportRequest request, User currentUser) {
        List<BulkReminderRow> rows = request.getRows();
        List<BulkImportResult.RowResult> results = new ArrayList<>(rows.size());
        int created = 0, failed = 0;

        for (int i = 0; i < rows.size(); i++) {
            BulkReminderRow row = rows.get(i);
            try {
                ReminderRequest req = toReminderRequest(row, currentUser);
                ReminderResponse saved = reminderService.createReminder(req, currentUser);
                results.add(new BulkImportResult.RowResult(i, true, saved.getId(), null));
                created++;
            } catch (Exception e) {
                logger.warn("Bulk import row {} failed: {}", i, e.getMessage());
                results.add(new BulkImportResult.RowResult(i, false, null, e.getMessage()));
                failed++;
            }
        }

        return new BulkImportResult(rows.size(), created, failed, results);
    }

    private ReminderRequest toReminderRequest(BulkReminderRow row, User currentUser) {
        ReminderRequest req = new ReminderRequest();
        req.setTitle(row.getTitle());
        req.setMessage(row.getMessage());
        req.setDateTime(row.getDateTime());
        req.setStatus("SCHEDULED");
        req.setRepeat(row.getRepeat() != null ? row.getRepeat().toUpperCase() : "NONE");
        req.setChannels(normalizeChannels(row.getChannels()));

        String target = row.getTargetType() != null ? row.getTargetType().trim().toUpperCase() : "PERSONAL";
        switch (target) {
            case "GROUP": {
                if (row.getGroupName() == null || row.getGroupName().isBlank()) {
                    throw new IllegalArgumentException("targetType=GROUP için groupName zorunlu");
                }
                Group group = findGroupByName(row.getGroupName(), currentUser);
                req.setType("GROUP");
                req.setGroupId(group.getId().toString());
                break;
            }
            case "CONTACT": {
                if (row.getContactEmail() == null || row.getContactEmail().isBlank()) {
                    throw new IllegalArgumentException("targetType=CONTACT için contactEmail zorunlu");
                }
                ContactRequest c = new ContactRequest();
                c.setName(row.getContactName() != null ? row.getContactName() : row.getContactEmail());
                c.setEmail(row.getContactEmail());
                c.setPhone(row.getContactPhone());
                req.setType("PERSONAL");
                req.setContact(c);
                break;
            }
            case "PERSONAL":
                req.setType("PERSONAL");
                break;
            default:
                throw new IllegalArgumentException("Geçersiz targetType: " + target);
        }
        return req;
    }

    private Group findGroupByName(String name, User currentUser) {
        return groupRepository.findByOwner(currentUser).stream()
                .filter(g -> name.equalsIgnoreCase(g.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Grup bulunamadı: " + name));
    }

    /** Normalize channel strings (uppercase, trim) and validate against known values upstream. */
    private List<String> normalizeChannels(List<String> raw) {
        if (raw == null || raw.isEmpty()) {
            throw new IllegalArgumentException("En az bir kanal seçilmeli");
        }
        List<String> out = new ArrayList<>(raw.size());
        for (String c : raw) {
            if (c == null) continue;
            String trimmed = c.trim().toUpperCase();
            if (!trimmed.isEmpty()) out.add(trimmed);
        }
        if (out.isEmpty()) {
            throw new IllegalArgumentException("En az bir kanal seçilmeli");
        }
        return out;
    }
}
