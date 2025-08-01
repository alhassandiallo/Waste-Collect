package com.wastecollect.common.dto.report;

import java.time.LocalDateTime;

public class ReportDTO {
    private Long id;
    private String title;
    private String type;
    private String period;
    private LocalDateTime generatedDate;
    private String status; // e.g., "completed", "processing", "failed"
    private String format;
    private String fileSize;
    private String municipalityName; // Name of the municipality the report is for, or "Toutes"
    private String generatedBy; // Name of the admin who generated it

    public ReportDTO() {}

    public ReportDTO(Long id, String title, String type, String period, LocalDateTime generatedDate, String status,
                     String format, String fileSize, String municipalityName, String generatedBy) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.period = period;
        this.generatedDate = generatedDate;
        this.status = status;
        this.format = format;
        this.fileSize = fileSize;
        this.municipalityName = municipalityName;
        this.generatedBy = generatedBy;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getPeriod() {
        return period;
    }

    public void setPeriod(String period) {
        this.period = period;
    }

    public LocalDateTime getGeneratedDate() {
        return generatedDate;
    }

    public void setGeneratedDate(LocalDateTime generatedDate) {
        this.generatedDate = generatedDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public String getFileSize() {
        return fileSize;
    }

    public void setFileSize(String fileSize) {
        this.fileSize = fileSize;
    }

    public String getMunicipalityName() {
        return municipalityName;
    }

    public void setMunicipalityName(String municipalityName) {
        this.municipalityName = municipalityName;
    }

    public String getGeneratedBy() {
        return generatedBy;
    }

    public void setGeneratedBy(String generatedBy) {
        this.generatedBy = generatedBy;
    }
}
