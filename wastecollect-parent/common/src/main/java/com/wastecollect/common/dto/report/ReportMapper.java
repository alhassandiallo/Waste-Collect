package com.wastecollect.common.dto.report;

import com.wastecollect.common.models.Report;

/**
 * Mapper class for converting Report entities to ReportDTOs and vice versa.
 */
public class ReportMapper {

    /**
     * Converts a Report entity to a ReportDTO.
     *
     * @param report The Report entity to convert.
     * @return The corresponding ReportDTO.
     */
    public static ReportDTO toDTO(Report report) {
        if (report == null) {
            return null;
        }
        return new ReportDTO(
                report.getId(),
                report.getTitle(),
                report.getType(),
                report.getPeriod(),
                report.getGeneratedDate(),
                report.getStatus(),
                report.getFormat(),
                report.getFileSize(),
                report.getMunicipalityName(),
                report.getGeneratedBy()
        );
    }

    /**
     * Converts a ReportDTO to a Report entity.
     * This method might be used if you need to convert DTOs back to entities for saving,
     * though often updates are done on fetched entities.
     *
     * @param reportDTO The ReportDTO to convert.
     * @return The corresponding Report entity.
     */
    public static Report toEntity(ReportDTO reportDTO) {
        if (reportDTO == null) {
            return null;
        }
        Report report = new Report();
        report.setId(reportDTO.getId());
        report.setTitle(reportDTO.getTitle());
        report.setType(reportDTO.getType());
        report.setPeriod(reportDTO.getPeriod());
        report.setGeneratedDate(reportDTO.getGeneratedDate());
        report.setStatus(reportDTO.getStatus());
        report.setFormat(reportDTO.getFormat());
        report.setFileSize(reportDTO.getFileSize());
        report.setMunicipalityName(reportDTO.getMunicipalityName());
        report.setGeneratedBy(reportDTO.getGeneratedBy());
        return report;
    }
}

