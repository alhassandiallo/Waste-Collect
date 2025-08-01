package com.wastecollect.backend.controller;

import com.wastecollect.common.dto.*;
import com.wastecollect.common.models.Municipality;
import com.wastecollect.backend.repository.MunicipalityRepository;
import com.wastecollect.backend.service.MunicipalityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/municipalities")
@CrossOrigin(origins = "http://localhost:3000") // Configure this securely for production
public class MunicipalityController {

    @Autowired
    private MunicipalityService municipalityService;
    
    @Autowired
    private MunicipalityRepository municipalityRepository; // Keep if needed for general municipality list

    @GetMapping
    public ResponseEntity<List<String>> getAllMunicipalityNames() {
        List<String> municipalityNames = municipalityRepository.findAll()
                                            .stream()
                                            .map(Municipality::getMunicipalityName)
                                            .collect(Collectors.toList());
        return ResponseEntity.ok(municipalityNames);
    }

    /**
     * Endpoint to get waste collection data for a specific municipality within a date range.
     * Requires MUNICIPAL_MANAGER role.
     * @param municipalityId The ID of the municipality.
     * @param startDate The start date for aggregation (optional).
     * @param endDate The end date for aggregation (optional).
     * @return Aggregated WasteCollectionDataDTO.
     */
    @GetMapping("/collection-data")
    @PreAuthorize("hasRole('MUNICIPAL_MANAGER')")
    public ResponseEntity<WasteCollectionDataDTO> getWasteCollectionData(
            @RequestParam(required = true) Long municipalityId, // Made required as per service method
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate) {
        // Provide default dates if not specified (e.g., last month)
        if (startDate == null) {
            startDate = LocalDateTime.now().minusMonths(1);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }
        return ResponseEntity.ok(municipalityService.getWasteCollectionData(municipalityId, startDate, endDate));
    }

    /**
     * Endpoint to identify underserved areas for a specific municipality.
     * Requires MUNICIPAL_MANAGER role.
     * @param municipalityId The ID of the municipality.
     * @param daysThreshold The number of days since last collection to consider an area underserved (optional, default 30).
     * @param minPendingRequests The minimum number of pending requests to consider an area underserved (optional, default 3).
     * @return List of HouseholdDTOs for underserved areas.
     */
    @GetMapping("/underserved-areas")
    @PreAuthorize("hasRole('MUNICIPAL_MANAGER')")
    public ResponseEntity<List<HouseholdDTO>> getUnderservedAreas(
            @RequestParam(required = true) Long municipalityId, // Made required as per service method
            @RequestParam(defaultValue = "30") int daysThreshold, // Default value for threshold
            @RequestParam(defaultValue = "3") int minPendingRequests) { // Default value for min pending requests
        return ResponseEntity.ok(municipalityService.identifyUnderservedAreas(municipalityId, daysThreshold, minPendingRequests));
    }

    /**
     * Endpoint to get metrics analysis for a specific municipality within a date range.
     * Requires MUNICIPAL_MANAGER role.
     * @param municipalityId The ID of the municipality.
     * @param startDate The start date for metrics calculation (optional).
     * @param endDate The end date for metrics calculation (optional).
     * @return MunicipalityMetricsDTO with KPIs.
     */
    @GetMapping("/metrics-analysis")
    @PreAuthorize("hasRole('MUNICIPAL_MANAGER')")
    public ResponseEntity<MunicipalityMetricsDTO> getMetricsAnalysis(
            @RequestParam(required = true) Long municipalityId, // Made required as per service method
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate) {
        // Provide default dates if not specified
        if (startDate == null) {
            startDate = LocalDateTime.now().minusMonths(1);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }
        return ResponseEntity.ok(municipalityService.getMetricsAnalysis(municipalityId, startDate, endDate));
    }

    /**
     * Endpoint to get waste mapping data for a specific municipality within a date range.
     * Requires MUNICIPAL_MANAGER role.
     * @param municipalityId The ID of the municipality.
     * @param startDate The start date for mapping data (optional).
     * @param endDate The end date for mapping data (optional).
     * @return WasteMappingDTO with geographical points.
     */
    @GetMapping("/waste-mapping")
    @PreAuthorize("hasRole('MUNICIPAL_MANAGER')")
    public ResponseEntity<WasteMappingDTO> getWasteMappingData(
            @RequestParam(required = true) Long municipalityId, // Made required as per service method
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate) {
        // Provide default dates if not specified
        if (startDate == null) {
            startDate = LocalDateTime.now().minusMonths(1);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }
        return ResponseEntity.ok(municipalityService.getWasteMappingData(municipalityId, startDate, endDate));
    }

    /**
     * Endpoint to generate a detailed report for a specific municipality.
     * Requires MUNICIPAL_MANAGER role.
     * @param municipalityId The ID of the municipality.
     * @param startDate The start date for the report (optional).
     * @param endDate The end date for the report (optional).
     * @param daysThresholdUnderserved The threshold for days since last collection for underserved areas (optional, default 30).
     * @param minPendingRequestsUnderserved The minimum pending requests for underserved areas (optional, default 3).
     * @return DetailedReportDTO with all compiled report sections.
     */
    @GetMapping("/detailed-report")
    @PreAuthorize("hasRole('MUNICIPAL_MANAGER')")
    public ResponseEntity<DetailedReportDTO> getDetailedReport(
            @RequestParam(required = true) Long municipalityId, // Made required as per service method
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate,
            @RequestParam(defaultValue = "30") int daysThresholdUnderserved,
            @RequestParam(defaultValue = "3") int minPendingRequestsUnderserved) {
        // Provide default dates if not specified
        if (startDate == null) {
            startDate = LocalDateTime.now().minusMonths(1);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }
        return ResponseEntity.ok(municipalityService.generateDetailedReport(
                municipalityId, startDate, endDate, daysThresholdUnderserved, minPendingRequestsUnderserved));
    }

    /**
     * Endpoint to get comparative data for a specific municipality.
     * Requires MUNICIPAL_MANAGER role.
     * @param municipalityId The ID of the municipality.
     * @param startDate The start date for comparative data (optional).
     * @param endDate The end date for comparative data (optional).
     * @return ComparativeDataDTO with comparative metrics.
     */
    @GetMapping("/comparative-data")
    @PreAuthorize("hasRole('MUNICIPAL_MANAGER')")
    public ResponseEntity<ComparativeDataDTO> getComparativeData(
            @RequestParam(required = true) Long municipalityId, // Made required as per service method
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate) {
        // Provide default dates if not specified
        if (startDate == null) {
            startDate = LocalDateTime.now().minusMonths(1);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }
        return ResponseEntity.ok(municipalityService.getComparativeMunicipalityData(municipalityId, startDate, endDate));
    }
}
