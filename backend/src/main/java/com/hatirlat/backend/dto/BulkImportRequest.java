package com.hatirlat.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public class BulkImportRequest {

    @NotEmpty
    @Size(max = 500, message = "En fazla 500 satır işlenebilir")
    @Valid
    private List<BulkReminderRow> rows;

    public List<BulkReminderRow> getRows() { return rows; }
    public void setRows(List<BulkReminderRow> rows) { this.rows = rows; }
}
