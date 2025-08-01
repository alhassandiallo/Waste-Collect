// File: com/wastecollect/backend/controller/AdminController.java
package com.wastecollect.backend.controller;

import com.wastecollect.common.dto.*; // Import all DTOs from the common package
import com.wastecollect.backend.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page; // Import Page
import org.springframework.data.domain.Pageable; // Import Pageable
import org.springframework.data.web.PageableDefault; // Import PageableDefault
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime; // Import LocalDateTime
import java.util.HashMap;
import java.util.List;
import java.util.Map; // For generic map responses
// Removed: import java.time.LocalDateTime; as ReportDTO will now be imported

// NEW Import
import com.wastecollect.common.dto.notification.CreateNotificationRequest;
import com.wastecollect.common.dto.report.ReportConfigDTO;
import com.wastecollect.common.dto.report.ReportDTO;
import com.wastecollect.backend.exception.ResourceException;


@RestController
@RequestMapping("/api/v1/admin")
// @CrossOrigin(origins = "http://localhost:3000") // Removed: Use global CORS config
@PreAuthorize("hasRole('ADMIN')") // All methods in AdminController require ADMIN role by default
public class AdminController {

    @Autowired
    private AdminService adminService;
    
    // --- New Endpoint for fetching all users (e.g., for manager selection in municipalities) ---
    @GetMapping("/users")
    public ResponseEntity<Page<UserDTO>> getAllUsers(
            @RequestParam Map<String, String> filters,
            @PageableDefault(page = 0, size = 10) Pageable pageable) {
        Page<UserDTO> usersPage = adminService.getAllUsers(filters, pageable);
        return ResponseEntity.ok(usersPage);
    }

    // --- Admin Profile Management ---
    @GetMapping("/profile/{id}")
    public ResponseEntity<AdminProfileDTO> getAdminProfile(@PathVariable Long id) {
        AdminProfileDTO adminProfile = adminService.getAdminProfile(id);
        return ResponseEntity.ok(adminProfile);
    }

	/*
	 * @PutMapping("/profile/{id}") public ResponseEntity<AdminProfileDTO>
	 * updateAdminProfile(@PathVariable Long id, @Valid @RequestBody UserUpdateDTO
	 * dto) { AdminProfileDTO updatedAdminProfile =
	 * adminService.updateAdminProfile(id, dto); return
	 * ResponseEntity.ok(updatedAdminProfile); }
	 */
    
    @PutMapping("/profile/{id}")
    public ResponseEntity<AdminProfileDTO> updateAdminProfile(@PathVariable Long id, @Valid @RequestBody AdminUpdateDTO dto) { // Changed DTO to AdminUpdateDTO
        AdminProfileDTO updatedAdminProfile = adminService.updateAdminProfile(id, dto);
        return ResponseEntity.ok(updatedAdminProfile);
    }

    @DeleteMapping("/profile/{id}")
    public ResponseEntity<String> deleteAdmin(@PathVariable Long id) {
        adminService.deleteAdmin(id);
        return ResponseEntity.ok("Admin deleted successfully");
    }

    // --- Municipality Management ---
    @PostMapping("/municipalities")
    public ResponseEntity<String> createMunicipality(@Valid @RequestBody MunicipalityCreationDTO dto) {
        adminService.createMunicipality(dto); // Creates municipality AND its initial manager
        return ResponseEntity.status(HttpStatus.CREATED).body("Municipality and its initial manager created successfully");
    }

    @PutMapping("/municipalities/{id}")
    public ResponseEntity<MunicipalityDTO> updateMunicipality(@PathVariable Long id, @Valid @RequestBody MunicipalityDTO dto) {
        MunicipalityDTO updatedMunicipality = adminService.updateMunicipality(id, dto);
        return ResponseEntity.ok(updatedMunicipality);
    }

    @DeleteMapping("/municipalities/{id}")
    public ResponseEntity<String> deleteMunicipality(@PathVariable Long id) {
        adminService.deleteMunicipality(id);
        return ResponseEntity.ok("Municipality deleted successfully");
    }

    // FIX: Changed to return Page<MunicipalityDTO> and accept Pageable for pagination
    // Added @RequestParam for search and province filters
    @GetMapping("/municipalities")
    public ResponseEntity<Page<MunicipalityDTO>> getAllMunicipalities(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String province,
            @PageableDefault(page = 0, size = 10) Pageable pageable) {
        Page<MunicipalityDTO> municipalities = adminService.getAllMunicipalities(search, province, pageable);
        return ResponseEntity.ok(municipalities);
    }

    // Re-added: Get Municipality by ID
    @GetMapping("/municipalities/{id}")
    public ResponseEntity<MunicipalityDTO> getMunicipalityById(@PathVariable Long id) {
        MunicipalityDTO municipality = adminService.getMunicipalityById(id);
        return ResponseEntity.ok(municipality);
    }

    // Re-added: Add Municipal Manager to Existing Municipality
    @PostMapping("/municipalities/{municipalityId}/managers")
    public ResponseEntity<MunicipalManagerProfileDTO> addMunicipalManagerToExistingMunicipality(
            @PathVariable Long municipalityId,
            @Valid @RequestBody MunicipalManagerCreationDTO creationDTO) {
        // Ensure the DTO's municipalityId matches the path variable, or set it
        creationDTO.setMunicipalityId(municipalityId); // Important: ensure consistency
        MunicipalManagerProfileDTO createdManager = adminService.createMunicipalManagerForExistingMunicipality(creationDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdManager);
    }

    // --- Collector Management ---
    // FIX: Changed to return Page<CollectorProfileDTO> and accept Pageable for pagination
    // Added @RequestParam for search, status, and municipality filters
    @GetMapping("/collectors")
    public ResponseEntity<Page<CollectorProfileDTO>> listCollectors(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String municipality,
            @PageableDefault(page = 0, size = 10) Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllCollectors(search, status, municipality, pageable));
    }

    @PostMapping("/collectors")
    public ResponseEntity<String> createCollector(@Valid @RequestBody CollectorCreationDTO collectorDto) {
        adminService.createCollector(collectorDto);
        return ResponseEntity.status(HttpStatus.CREATED).body("Collector created successfully");
    }

    @PutMapping("/collectors/{id}")
    public ResponseEntity<String> updateCollector(@PathVariable Long id, @Valid @RequestBody CollectorUpdateDTO collectorDto) {
        adminService.updateCollector(id, collectorDto);
        return ResponseEntity.ok("Collector updated successfully");
    }

    @DeleteMapping("/collectors/{id}")
    public ResponseEntity<String> deleteCollector(@PathVariable Long id) {
        adminService.deleteCollector(id);
        return ResponseEntity.ok("Collector deleted successfully");
    }

    // Re-added: Endpoint for toggling collector status
    @PatchMapping("/collectors/{id}/status")
    public ResponseEntity<String> toggleCollectorStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> statusUpdate) {
        Boolean isActive = statusUpdate.get("isActive");
        if (isActive == null) {
            return ResponseEntity.badRequest().body("Missing 'isActive' status in request body.");
        }
        adminService.toggleCollectorStatus(id, isActive);
        return ResponseEntity.ok("Collector status updated successfully.");
    }
    
    // --- Household Management ---
    // FIX: Changed to return Page<HouseholdProfileDTO> and accept Pageable for pagination
    // Added @RequestParam for search, municipality, and housingType filters
    @GetMapping("/households")
    public ResponseEntity<Page<HouseholdProfileDTO>> listHouseholds(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String municipality,
            @RequestParam(required = false) String housingType,
            @PageableDefault(page = 0, size = 10) Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllHouseholds(search, municipality, housingType, pageable));
    }

    @PostMapping("/households")
    public ResponseEntity<String> createHousehold(@Valid @RequestBody HouseholdCreationDTO householdDto) {
        adminService.createHousehold(householdDto);
        return ResponseEntity.status(HttpStatus.CREATED).body("Household created successfully");
    }

    @PutMapping("/households/{id}")
    public ResponseEntity<String> updateHousehold(@PathVariable Long id, @Valid @RequestBody HouseholdUpdateDTO householdDto) {
        adminService.updateHousehold(id, householdDto);
        return ResponseEntity.ok("Household updated successfully");
    }

    @DeleteMapping("/households/{id}")
    public ResponseEntity<String> deleteHousehold(@PathVariable Long id) {
        adminService.deleteHousehold(id);
        return ResponseEntity.ok("Household deleted successfully");
    }

    // Re-added: Get Household by ID
    @GetMapping("/households/{id}")
    public ResponseEntity<HouseholdProfileDTO> getHouseholdById(@PathVariable Long id) {
        HouseholdProfileDTO household = adminService.getHouseholdById(id);
        return ResponseEntity.ok(household);
    }

    // ==================== DASHBOARD & STATISTICS ENDPOINTS ====================

    /**
     * Retrieves global statistics for the admin dashboard.
     * @param period The time period for the statistics (e.g., "week", "month", "year").
     * @return A ResponseEntity containing the statistics map.
     */
    @GetMapping("/statistics/global")
    public ResponseEntity<Map<String, Object>> getGlobalStatistics(@RequestParam(defaultValue = "week") String period) {
        Map<String, Object> stats = adminService.getGlobalStatistics(period);
        return ResponseEntity.ok(stats);
    }

    /**
     * Retrieves recent activities for the admin dashboard.
     * @return A ResponseEntity containing a list of recent activities.
     */
    @GetMapping("/activities/recent")
    public ResponseEntity<List<Map<String, Object>>> getRecentActivities() {
        List<Map<String, Object>> activities = adminService.getRecentActivities();
        return ResponseEntity.ok(activities);
    }

    /**
     * Retrieves performance metrics for the admin dashboard.
     * @param period The time period for the metrics.
     * @return A ResponseEntity containing performance metrics.
     */
    @GetMapping("/metrics/performance")
    public ResponseEntity<Map<String, Object>> getPerformanceMetrics(@RequestParam(defaultValue = "week") String period) {
        Map<String, Object> metrics = adminService.getPerformanceMetrics(period);
        return ResponseEntity.ok(metrics);
    }

    /**
     * Retrieves system alerts for the admin dashboard.
     * @return A ResponseEntity containing a list of system alerts.
     */
    @GetMapping("/alerts/system")
    public ResponseEntity<List<Map<String, Object>>> getSystemAlerts() {
        List<Map<String, Object>> alerts = adminService.getSystemAlerts();
        return ResponseEntity.ok(alerts);
    }

    /**
     * Retrieves aggregated waste collection data for the entire system (all municipalities).
     * @param startDate - The start date for aggregation (e.g., "2023-01-01T00:00:00").
     * @param endDate - The end date for aggregation (e.g., "2023-01-31T23:59:59").
     * @return A map containing aggregated waste collection data.
     */
    @GetMapping("/dashboard/waste-collection-data")
    public ResponseEntity<Map<String, Object>> getGlobalWasteCollectionData(
            @RequestParam String startDate, 
            @RequestParam String endDate) {
        Map<String, Object> data = adminService.getGlobalWasteCollectionData(
            LocalDateTime.parse(startDate), LocalDateTime.parse(endDate));
        return ResponseEntity.ok(data);
    }

    /**
     * Performs aggregated metrics analysis for the entire system (all municipalities).
     * @param startDate - The start date for analysis (e.g., "2023-01-01T00:00:00").
     * @param endDate - The end date for analysis (e.g., "2023-01-31T23:59:59").
     * @return A map containing various global metrics.
     */
    @GetMapping("/dashboard/metrics-analysis")
    public ResponseEntity<Map<String, Object>> getGlobalMetricsAnalysis(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        Map<String, Object> metrics = adminService.getGlobalMetricsAnalysis(
            LocalDateTime.parse(startDate), LocalDateTime.parse(endDate));
        return ResponseEntity.ok(metrics);
    }

    /**
     * Identifies the count of underserved areas across all municipalities.
     * @return The total count of underserved areas.
     */
    @GetMapping("/dashboard/underserved-areas-count")
    public ResponseEntity<Integer> getGlobalUnderservedAreasCount() {
        Integer count = adminService.getGlobalUnderservedAreasCount();
        return ResponseEntity.ok(count);
    }


    // Re-added: Generates a new report.
    @PostMapping("/reports/generate")
    public ResponseEntity<String> generateReport(@Valid @RequestBody ReportConfigDTO reportConfigDTO) {
        adminService.generateReport(reportConfigDTO);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body("Report generation initiated.");
    }

    /**
     * Retrieves a paginated list of generated reports with optional filters.
     * @param filters A map containing filter criteria (e.g., "type", "status", "search").
     * @param pageable Pageable object for pagination and sorting.
     * @return A paginated list of ReportDTOs.
     */
    @GetMapping("/reports")
    public ResponseEntity<Page<ReportDTO>> getGeneratedReports(
            @RequestParam(required = false) Map<String, String> filters,
            @PageableDefault(page = 0, size = 10) Pageable pageable) {
        Page<ReportDTO> reportPage = adminService.getGeneratedReports(filters, pageable);
        return ResponseEntity.ok(reportPage);
    }

    // Re-added: Downloads a specific report.
    @GetMapping("/reports/{id}/download")
    public ResponseEntity<byte[]> downloadReport(@PathVariable Long id) throws IOException {
        byte[] fileContent = adminService.downloadReport(id);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"report_" + id + ".pdf\"") // Example filename
                .body(fileContent);
    }

    // Re-added: Retrieves map data (e.g., coverage gaps).
    @GetMapping("/map-data")
    public ResponseEntity<Map<String, Object>> getMapData(@RequestParam Map<String, String> mapConfigDTO) {
        Map<String, Object> mapData = adminService.getMapData(mapConfigDTO);
        return ResponseEntity.ok(mapData);
    }

    // Re-added: Performs predictive analysis.
    @PostMapping("/predictive-analysis")
    public ResponseEntity<Map<String, Object>> getPredictiveAnalysis(@RequestBody Map<String, Object> predictionConfigDTO) {
        Map<String, Object> analysisResult = adminService.getPredictiveAnalysis(predictionConfigDTO);
        return ResponseEntity.ok(analysisResult);
    }

    /**
     * Endpoint for Admin to create and send notifications to various target audiences.
     * Requires ADMIN role.
     *
     * @param request The CreateNotificationRequestDTO containing notification details and target info.
     * @return ResponseEntity indicating success or failure.
     */
    @PostMapping("/notifications/send")
    @PreAuthorize("hasRole('ADMIN')") // Ensure only ADMINs can send notifications
    public ResponseEntity<String> sendNotifications(@Valid @RequestBody CreateNotificationRequest request) {
        try {
            adminService.sendNotifications(request);
            return ResponseEntity.ok("Notifications sent successfully.");
        } catch (ResourceException e) {
            // Log the error for debugging
            org.slf4j.LoggerFactory.getLogger(AdminController.class).error("Failed to send notifications: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            // Log unexpected errors
            org.slf4j.LoggerFactory.getLogger(AdminController.class).error("An unexpected error occurred while sending notifications.", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred while sending notifications.");
        }
    }
}
