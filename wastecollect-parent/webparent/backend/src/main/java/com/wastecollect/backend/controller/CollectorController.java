package com.wastecollect.backend.controller;

import com.wastecollect.common.dto.*;
import com.wastecollect.common.models.Collector;
import com.wastecollect.common.models.Notification;
import com.wastecollect.backend.exception.ResourceNotFoundException;
import com.wastecollect.backend.service.CollectorService;
import com.wastecollect.backend.service.UserService; // Import UserService
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/collector")
@CrossOrigin(origins = "http://localhost:3000")
public class CollectorController {

	private static final Logger logger = LoggerFactory.getLogger(CollectorController.class);

    @Autowired
    private CollectorService collectorService;

    @Autowired
    private UserService userService; // Inject UserService

    /**
     * Retrieves the profile of the authenticated collector.
     * @return A CollectorProfileDTO containing the collector's profile information.
     */
    @GetMapping("/profile")
    public ResponseEntity<CollectorProfileDTO> getCollectorProfile() {
        logger.info("Fetching profile for authenticated collector.");
        try {
            CollectorProfileDTO profile = collectorService.getCollectorProfile();
            return ResponseEntity.ok(profile);
        } catch (IllegalStateException e) {
            logger.error("Error fetching collector profile: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        } catch (Exception e) {
            logger.error("Internal server error fetching collector profile: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    /**
     * Updates the profile of the authenticated collector.
     * @param profileUpdateDto DTO containing the updated profile information.
     * @return A success message or an error message.
     */
    @PutMapping("/profile") // Added PUT mapping for profile updates
    public ResponseEntity<String> updateCollectorProfile(@RequestBody CollectorUpdateDTO profileUpdateDto) {
        logger.info("Collector attempting to update profile.");
        try {
            collectorService.updateCollectorProfile(profileUpdateDto);
            logger.info("Collector profile updated successfully.");
            return ResponseEntity.ok("Collector profile updated successfully.");
        } catch (IllegalStateException e) {
            logger.error("Error updating collector profile: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (ResourceNotFoundException e) {
            logger.error("Error updating collector profile: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Internal server error updating collector profile: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update collector profile.");
        }
    }

    /**
     * Retrieves all service requests relevant to the authenticated collector.
     * This includes pending, accepted, and in-progress requests.
     * @return A list of ServiceRequestDTOs.
     */
    @GetMapping("/service-requests")
    public ResponseEntity<List<ServiceRequestDTO>> getRequestsForCollector() {
        logger.info("Fetching service requests for authenticated collector.");
        try {
            List<ServiceRequestDTO> requests = collectorService.getRequestsForAuthenticatedCollector();
            return ResponseEntity.ok(requests);
        } catch (IllegalStateException e) {
            logger.error("Error fetching service requests: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null); // Or appropriate error status
        } catch (Exception e) {
            logger.error("Internal server error fetching service requests: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Allows the authenticated collector to accept a service request.
     * @param serviceRequestId The ID of the service request to accept.
     * @param actionDto DTO containing notes for acceptance.
     * @return A success message or an error message.
     */
    @PostMapping("/{serviceRequestId}/accept")
    public ResponseEntity<String> acceptServiceRequest(@PathVariable Long serviceRequestId, @RequestBody ServiceRequestActionDTO actionDto) {
        logger.info("Collector attempting to accept service request ID: {}", serviceRequestId);
        try {
            collectorService.acceptServiceRequest(serviceRequestId, actionDto);
            logger.info("Service request ID: {} accepted successfully.", serviceRequestId);
            return ResponseEntity.ok("Service request accepted successfully.");
        } catch (IllegalStateException | ResourceNotFoundException e) {
            logger.error("Error accepting service request ID {}: {}", serviceRequestId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Internal server error accepting service request ID {}: {}", serviceRequestId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to accept service request.");
        }
    }

    /**
     * Allows the authenticated collector to reject a service request.
     * @param serviceRequestId The ID of the service request to reject.
     * @param actionDto DTO containing the rejection reason.
     * @return A success message or an error message.
     */
    @PostMapping("/{serviceRequestId}/reject")
    public ResponseEntity<String> rejectServiceRequest(@PathVariable Long serviceRequestId, @RequestBody ServiceRequestActionDTO actionDto) {
        logger.info("Collector attempting to reject service request ID: {}", serviceRequestId);
        try {
            collectorService.rejectServiceRequest(serviceRequestId, actionDto);
            logger.info("Service request ID: {} rejected successfully.", serviceRequestId);
            return ResponseEntity.ok("Service request rejected successfully.");
        } catch (IllegalStateException | ResourceNotFoundException e) {
            logger.error("Error rejecting service request ID {}: {}", serviceRequestId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Internal server error rejecting service request ID {}: {}", serviceRequestId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to reject service request.");
        }
    }

    /**
     * Allows the authenticated collector to mark a service request as in progress.
     * @param serviceRequestId The ID of the service request to start.
     * @return A success message or an error message.
     */
    @PostMapping("/{serviceRequestId}/start")
    public ResponseEntity<String> startServiceRequest(@PathVariable Long serviceRequestId) {
        logger.info("Collector attempting to start service request ID: {}", serviceRequestId);
        try {
            collectorService.startServiceRequest(serviceRequestId);
            logger.info("Service request ID: {} started successfully.", serviceRequestId);
            return ResponseEntity.ok("Service request started successfully.");
        } catch (IllegalStateException | ResourceNotFoundException e) {
            logger.error("Error starting service request ID {}: {}", serviceRequestId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }  catch (Exception e) {
            logger.error("Internal server error starting service request ID {}: {}", serviceRequestId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to start service request.");
        }
    }

    /**
     * Allows the authenticated collector to mark a service request as completed.
     * This also triggers the creation of a WasteCollection record.
     * @param serviceRequestId The ID of the service request to complete.
     * @param actionDto DTO containing completion notes (e.g., actual weight, comments).
     * @return A success message or an error message.
     */
    @PostMapping("/{serviceRequestId}/complete")
    public ResponseEntity<String> completeServiceRequest(@PathVariable Long serviceRequestId, @RequestBody ServiceRequestActionDTO actionDto) {
        logger.info("Collector attempting to complete service request ID: {}", serviceRequestId);
        try {
            collectorService.completeServiceRequest(serviceRequestId, actionDto);
            logger.info("Service request ID: {} completed successfully.", serviceRequestId);
            return ResponseEntity.ok("Service request completed successfully.");
        } catch (IllegalStateException | ResourceNotFoundException e) {
            logger.error("Error completing service request ID {}: {}", serviceRequestId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Internal server error completing service request ID {}: {}", serviceRequestId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to complete service request.");
        }
    }

    /**
     * Retrieves performance indicators for the authenticated collector.
     * This is used for the Collector Dashboard.
     * @return A CollectorDashboardSummaryDTO of performance indicators.
     */
    @GetMapping("/performance-indicators")
    public ResponseEntity<CollectorDashboardSummaryDTO> getPerformanceIndicators() {
        logger.info("Fetching performance indicators for collector.");
        try {
            CollectorDashboardSummaryDTO indicators = collectorService.getPerformanceIndicators();
            return ResponseEntity.ok(indicators);
        } catch (IllegalStateException e) {
            logger.error("Error fetching collector performance indicators: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        } catch (Exception e) {
            logger.error("Internal server error fetching collector performance indicators: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Retrieves detailed performance data for charts for the authenticated collector.
     * @param period The period for which to retrieve data (e.g., "DAY", "WEEK", "MONTH", "YEAR").
     * @return A Map containing performance data for charting.
     */
    @GetMapping("/performance-data")
    public ResponseEntity<Map<String, List<?>>> getCollectorPerformanceData(@RequestParam String period) {
        logger.info("Fetching performance data for collector for period: {}", period);
        try {
            Map<String, List<?>> data = collectorService.getCollectorPerformanceData(period);
            return ResponseEntity.ok(data);
        } catch (IllegalStateException e) {
            logger.error("Error fetching collector performance data: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", List.of(e.getMessage())));
        } catch (Exception e) {
            logger.error("Internal server error fetching collector performance data: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", List.of("Failed to retrieve performance data")));
        }
    }

    /**
     * Retrieves objectives for the authenticated collector.
     * @return An ObjectiveDTO containing the collector's objectives and current progress.
     */
    @GetMapping("/objectives")
    public ResponseEntity<ObjectiveDTO> getCollectorObjectives() {
        logger.info("Fetching objectives for collector.");
        try {
            ObjectiveDTO objectives = collectorService.getCollectorObjectives();
            return ResponseEntity.ok(objectives);
        } catch (IllegalStateException e) {
            logger.error("Error fetching collector objectives: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        } catch (Exception e) {
            logger.error("Internal server error fetching collector objectives: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Retrieves recent household feedback for the authenticated collector.
     * @param limit The maximum number of feedback entries to retrieve.
     * @return A list of HouseholdFeedbackDTOs.
     */
    @GetMapping("/recent-feedback")
    public ResponseEntity<List<HouseholdFeedbackDTO>> getRecentHouseholdFeedback(@RequestParam(defaultValue = "5") int limit) {
        logger.info("Fetching recent household feedback for collector, limit: {}", limit);
        try {
            List<HouseholdFeedbackDTO> feedback = collectorService.getRecentHouseholdFeedback(limit);
            return ResponseEntity.ok(feedback);
        } catch (IllegalStateException e) {
            logger.error("Error fetching recent household feedback: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        } catch (Exception e) {
            logger.error("Internal server error fetching recent household feedback: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Retrieves all security alerts relevant to the authenticated collector.
     * @return A list of NotificationDTOs.
     */
    @GetMapping("/alerts")
    public ResponseEntity<List<NotificationDTO>> getSecurityAlerts() {
        logger.info("Fetching security alerts for collector.");
        try {
            List<NotificationDTO> alerts = collectorService.getSecurityAlertsForCollector();
            return ResponseEntity.ok(alerts);
        } catch (IllegalStateException e) {
            logger.error("Error fetching security alerts: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        } catch (Exception e) {
            logger.error("Internal server error fetching security alerts: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Marks a security alert as read for the authenticated collector.
     * @param alertId The ID of the alert to mark as read.
     * @return A success message or an error message.
     */
    @PutMapping("/alerts/mark-as-read/{alertId}")
    public ResponseEntity<String> markAlertAsRead(@PathVariable Long alertId) {
        logger.info("Collector attempting to mark alert ID: {} as read.", alertId);
        try {
            collectorService.markSecurityAlertAsRead(alertId);
            logger.info("Alert ID: {} marked as read successfully.", alertId);
            return ResponseEntity.ok("Alert marked as read successfully.");
        } catch (ResourceNotFoundException e) {
            logger.error("Error marking alert ID {} as read: {}", alertId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Internal server error marking alert ID {} as read: {}", alertId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to mark alert as read.");
        }
    }

    /**
     * Retrieves mobile revenue details for the authenticated collector.
     * @return A list of PaymentDTOs.
     */
    @GetMapping("/revenue")
    public ResponseEntity<List<PaymentDTO>> getMobileRevenue() {
        logger.info("Fetching mobile revenue for collector.");
        try {
            List<PaymentDTO> payments = collectorService.getMobilePayments();
            return ResponseEntity.ok(payments);
        } catch (IllegalStateException e) {
            logger.error("Error fetching mobile revenue: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        } catch (Exception e) {
            logger.error("Internal server error fetching mobile revenue: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Allows the authenticated collector to send a security alert.
     * @param alertDto The NotificationDTO containing alert information.
     * @return A success message or an error message.
     */
    @PostMapping("/send-alert")
    public ResponseEntity<String> sendSecurityAlert(@RequestBody NotificationDTO alertDto) {
        logger.info("Collector attempting to send security alert.");
        try {
            collectorService.sendSecurityAlert(alertDto);
            logger.info("Security alert sent successfully.");
            return ResponseEntity.ok("Security alert sent successfully.");
        } catch (IllegalStateException e) {
            logger.error("Error sending security alert: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Internal server error sending security alert: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send security alert.");
        }
    }

    /**
     * Allows the authenticated collector to update their password.
     * @param passwordUpdateDto DTO containing current and new password.
     * @return A success message or an error message.
     */
    @PutMapping("/update-password")
    public ResponseEntity<String> updateCollectorPassword(@RequestBody PasswordUpdateDTO passwordUpdateDto) {
        logger.info("Collector attempting to update password.");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No authenticated user found.");
        }

        String userEmail = ((UserDetails) authentication.getPrincipal()).getUsername();

        if (!passwordUpdateDto.getNewPassword().equals(passwordUpdateDto.getConfirmNewPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("New password and confirmation do not match.");
        }

        try {
            userService.updatePassword(userEmail, passwordUpdateDto.getCurrentPassword(), passwordUpdateDto.getNewPassword());
            logger.info("Password updated successfully for collector: {}", userEmail);
            return ResponseEntity.ok("Password updated successfully.");
        } catch (IllegalArgumentException e) {
            logger.error("Error updating password for {}: {}", userEmail, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Internal server error updating password for {}: {}", userEmail, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update password.");
        }
    }
}
