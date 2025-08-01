// backend/controller/ServiceRequestController.java
package com.wastecollect.backend.controller;

import com.wastecollect.common.dto.ServiceRequestCreationDTO;
import com.wastecollect.common.dto.ServiceRequestDTO;
import com.wastecollect.common.dto.ServiceRequestUpdateDTO;
import com.wastecollect.common.utils.ServiceRequestStatus;
import com.wastecollect.backend.service.ServiceRequestService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@RestController
@RequestMapping("/api/v1/service-requests")
@CrossOrigin(origins = "http://localhost:3000")
public class ServiceRequestController {

    private static final Logger logger = LoggerFactory.getLogger(ServiceRequestController.class);

    @Autowired
    private ServiceRequestService serviceRequestService;

    @PostMapping
    @PreAuthorize("hasRole('HOUSEHOLD')")
    public ResponseEntity<ServiceRequestDTO> createServiceRequest(@Valid @RequestBody ServiceRequestCreationDTO creationDTO) {
        logger.info("Received request to create a new service request.");
        ServiceRequestDTO createdRequest = serviceRequestService.createServiceRequest(creationDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRequest);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('HOUSEHOLD', 'COLLECTOR', 'ADMIN', 'MUNICIPAL_MANAGER')")
    public ResponseEntity<ServiceRequestDTO> getServiceRequestById(@PathVariable Long id) {
        logger.info("Fetching service request with ID: {}", id);
        ServiceRequestDTO serviceRequest = serviceRequestService.getServiceRequestById(id);
        return ResponseEntity.ok(serviceRequest);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MUNICIPAL_MANAGER')")
    public ResponseEntity<List<ServiceRequestDTO>> getAllServiceRequests() {
        logger.info("Fetching all service requests.");
        List<ServiceRequestDTO> serviceRequests = serviceRequestService.getAllServiceRequests();
        return ResponseEntity.ok(serviceRequests);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MUNICIPAL_MANAGER', 'COLLECTOR')")
    public ResponseEntity<List<ServiceRequestDTO>> getServiceRequestsByStatus(@PathVariable ServiceRequestStatus status) {
        logger.info("Fetching service requests with status: {}", status);
        List<ServiceRequestDTO> serviceRequests = serviceRequestService.getServiceRequestsByStatus(status);
        return ResponseEntity.ok(serviceRequests);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MUNICIPAL_MANAGER')")
    public ResponseEntity<ServiceRequestDTO> updateServiceRequest(@PathVariable Long id, @Valid @RequestBody ServiceRequestUpdateDTO updateDTO) {
        logger.info("Updating service request with ID: {}", id);
        ServiceRequestDTO updatedRequest = serviceRequestService.updateServiceRequest(id, updateDTO);
        return ResponseEntity.ok(updatedRequest);
    }

    @PatchMapping("/{serviceRequestId}/assign-collector/{collectorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MUNICIPAL_MANAGER')")
    public ResponseEntity<ServiceRequestDTO> assignCollector(@PathVariable Long serviceRequestId, @PathVariable Long collectorId) {
        logger.info("Assigning collector ID: {} to service request ID: {}.", collectorId, serviceRequestId);
        ServiceRequestDTO updatedRequest = serviceRequestService.assignCollectorToServiceRequest(serviceRequestId, collectorId);
        return ResponseEntity.ok(updatedRequest);
    }

    @PatchMapping("/{serviceRequestId}/start")
    @PreAuthorize("hasRole('COLLECTOR')")
    public ResponseEntity<String> startServiceRequest(@PathVariable Long serviceRequestId) {
        logger.info("Collector attempting to start service request ID: {}", serviceRequestId);
        serviceRequestService.startServiceRequest(serviceRequestId);
        return ResponseEntity.ok("Service request started successfully.");
    }

    @PatchMapping("/{serviceRequestId}/complete")
    @PreAuthorize("hasRole('COLLECTOR')")
    public ResponseEntity<String> completeServiceRequest(@PathVariable Long serviceRequestId) {
        logger.info("Collector attempting to complete service request ID: {}", serviceRequestId);
        serviceRequestService.completeServiceRequest(serviceRequestId);
        return ResponseEntity.ok("Service request completed successfully.");
    }

    @PatchMapping("/{serviceRequestId}/cancel")
    @PreAuthorize("hasAnyRole('HOUSEHOLD', 'ADMIN', 'MUNICIPAL_MANAGER')")
    public ResponseEntity<String> cancelServiceRequest(@PathVariable Long serviceRequestId) {
        logger.info("Cancelling service request ID: {}", serviceRequestId);
        serviceRequestService.cancelServiceRequest(serviceRequestId);
        return ResponseEntity.ok("Service request cancelled successfully.");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteServiceRequest(@PathVariable Long id) {
        logger.info("Deleting service request with ID: {}", id);
        serviceRequestService.deleteServiceRequest(id);
        return ResponseEntity.ok("Service request deleted successfully.");
    }
}