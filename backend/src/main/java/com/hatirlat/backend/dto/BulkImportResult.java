package com.hatirlat.backend.dto;

import java.util.List;

public class BulkImportResult {

    public static class RowResult {
        private int rowIndex;
        private boolean success;
        private String reminderId;
        private String error;

        public RowResult() {}

        public RowResult(int rowIndex, boolean success, String reminderId, String error) {
            this.rowIndex = rowIndex;
            this.success = success;
            this.reminderId = reminderId;
            this.error = error;
        }

        public int getRowIndex() { return rowIndex; }
        public void setRowIndex(int rowIndex) { this.rowIndex = rowIndex; }
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getReminderId() { return reminderId; }
        public void setReminderId(String reminderId) { this.reminderId = reminderId; }
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
    }

    private int total;
    private int created;
    private int failed;
    private List<RowResult> rows;

    public BulkImportResult() {}

    public BulkImportResult(int total, int created, int failed, List<RowResult> rows) {
        this.total = total;
        this.created = created;
        this.failed = failed;
        this.rows = rows;
    }

    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }
    public int getCreated() { return created; }
    public void setCreated(int created) { this.created = created; }
    public int getFailed() { return failed; }
    public void setFailed(int failed) { this.failed = failed; }
    public List<RowResult> getRows() { return rows; }
    public void setRows(List<RowResult> rows) { this.rows = rows; }
}
