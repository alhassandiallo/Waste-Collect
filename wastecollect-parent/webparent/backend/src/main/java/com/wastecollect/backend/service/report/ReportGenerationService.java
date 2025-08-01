package com.wastecollect.backend.service.report;

import com.wastecollect.backend.repository.ReportRepository;
import com.wastecollect.common.dto.report.ReportConfigDTO;
import com.wastecollect.common.models.Report;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Random;

/**
 * Handles the logic for asynchronously generating different types of reports.
 * This version is updated to use String-based status fields to align with
 * the provided Report entity.
 */
@Service
public class ReportGenerationService {

    private static final Logger logger = LoggerFactory.getLogger(ReportGenerationService.class);

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private FileStorageService fileStorageService;

    /**
     * Asynchronously generates a report.
     *
     * @param reportId The ID of the report entity to update.
     * @param config The configuration for the report.
     */
    @Async("taskExecutor") // Ensure you have a bean named "taskExecutor" configured
    @Transactional
    public void generateReportAsync(Long reportId, ReportConfigDTO config) {
        logger.info("Starting async generation for report ID: {}", reportId);

        Report report = reportRepository.findById(reportId).orElse(null);
        if (report == null) {
            logger.error("Cannot generate report. Report with ID {} not found.", reportId);
            return;
        }

        // 1. Update status to "processing"
        report.setStatus("processing");
        reportRepository.saveAndFlush(report);

        try {
            // Simulate processing time
            Thread.sleep(5000 + new Random().nextInt(5000));

            // 2. Generate the report content
            byte[] reportContent = createReportContent(config);

            // 3. Store the generated file
            String fileName = String.format("report-%d-%s.%s", report.getId(), config.getType(), config.getFormat());
            String filePath = fileStorageService.saveFile(reportContent, fileName);
            
            // 4. Update the report entity to "completed"
            report.setStatus("completed");
            report.setFilePath(filePath);
            report.setFileSize(formatFileSize(reportContent.length));
            logger.info("Successfully generated and stored report ID: {}. Path: {}", reportId, filePath);

        } catch (Exception e) {
            logger.error("Failed to generate report ID: {}", reportId, e);
            // 5. Update the report entity to "failed"
            report.setStatus("failed");
            // Optionally store the failure reason if you add the field to your Report entity.
            // report.setFailureReason(e.getMessage()); 
        } finally {
            reportRepository.save(report);
        }
    }
    
    private byte[] createReportContent(ReportConfigDTO config) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        String content = String.format("--- %s ---\nPeriod: %s\nGenerated at: %s",
                config.getTitle(), config.getPeriod(), LocalDateTime.now());
        outputStream.write(content.getBytes());
        return outputStream.toByteArray();
    }

    private String formatFileSize(long size) {
        if (size < 1024) return size + " B";
        int exp = (int) (Math.log(size) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp-1) + "";
        return String.format("%.1f %sB", size / Math.pow(1024, exp), pre);
    }
}

