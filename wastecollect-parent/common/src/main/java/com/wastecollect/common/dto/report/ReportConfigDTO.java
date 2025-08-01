package com.wastecollect.common.dto.report;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ReportConfigDTO {
    @NotBlank(message = "Report title is required")
    private String title;

    @NotBlank(message = "Report type is required")
    private String type; // e.g., "performance", "collections", "predictive"

    @NotBlank(message = "Report period is required")
    private String period; // e.g., "daily", "weekly", "monthly", "quarterly", "yearly"

    @NotNull(message = "Include charts flag is required")
    private Boolean includeCharts;

    @NotBlank(message = "Report format is required")
    private String format; // e.g., "pdf", "excel", "both"

    // Optional filters
    private Long municipalityId;
    private Long collectorId;
    private String startDate; // ISO date string
    private String endDate;   // ISO date string

    public ReportConfigDTO() {}

    public ReportConfigDTO(String title, String type, String period, Boolean includeCharts, String format,
                           Long municipalityId, Long collectorId, String startDate, String endDate) {
        this.title = title;
        this.type = type;
        this.period = period;
        this.includeCharts = includeCharts;
        this.format = format;
        this.municipalityId = municipalityId;
        this.collectorId = collectorId;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    // Getters and Setters
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

    public Boolean getIncludeCharts() {
        return includeCharts;
    }

    public void setIncludeCharts(Boolean includeCharts) {
        this.includeCharts = includeCharts;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public Long getMunicipalityId() {
        return municipalityId;
    }

    public void setMunicipalityId(Long municipalityId) {
        this.municipalityId = municipalityId;
    }

    public Long getCollectorId() {
        return collectorId;
    }

    public void setCollectorId(Long collectorId) {
        this.collectorId = collectorId;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }
}
