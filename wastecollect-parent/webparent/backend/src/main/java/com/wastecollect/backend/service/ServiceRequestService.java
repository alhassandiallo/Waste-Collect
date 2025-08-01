// backend/service/ServiceRequestService.java
package com.wastecollect.backend.service;

import com.wastecollect.common.dto.ServiceRequestCreationDTO;
import com.wastecollect.common.dto.ServiceRequestDTO;
import com.wastecollect.common.dto.ServiceRequestUpdateDTO;
import com.wastecollect.common.models.ServiceRequest;
import com.wastecollect.common.models.Household;
import com.wastecollect.common.models.Collector;
import com.wastecollect.common.utils.ServiceRequestStatus;
import com.wastecollect.backend.repository.ServiceRequestRepository;
import com.wastecollect.backend.repository.HouseholdRepository;
import com.wastecollect.backend.repository.CollectorRepository;
import com.wastecollect.backend.exception.ResourceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ServiceRequestService {

    private static final Logger logger = LoggerFactory.getLogger(ServiceRequestService.class);

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private HouseholdRepository householdRepository;

    @Autowired
    private CollectorRepository collectorRepository;

    @Transactional
    public ServiceRequestDTO createServiceRequest(ServiceRequestCreationDTO creationDTO) {
        logger.info("Creating new service request for household ID: {}", creationDTO.getHouseholdId());

        Household household = householdRepository.findById(creationDTO.getHouseholdId())
                .orElseThrow(() -> new ResourceException("Household", "id", creationDTO.getHouseholdId().toString()));

        ServiceRequest serviceRequest = new ServiceRequest();
        serviceRequest.setDescription(creationDTO.getDescription());
        serviceRequest.setWasteType(creationDTO.getWasteType());
        serviceRequest.setEstimatedVolume(creationDTO.getEstimatedVolume());
        serviceRequest.setPreferredDate(creationDTO.getPreferredDate());
        serviceRequest.setPhoneNumber(creationDTO.getPhone());
        serviceRequest.setAddress(creationDTO.getAddress());
        serviceRequest.setComment(creationDTO.getComment());
        serviceRequest.setHousehold(household);
        serviceRequest.setMunicipality(household.getMunicipality());
        serviceRequest.setStatus(ServiceRequestStatus.PENDING);
        serviceRequest.setCreatedAt(LocalDateTime.now());
        serviceRequest.setUpdatedAt(LocalDateTime.now());

        ServiceRequest savedRequest = serviceRequestRepository.save(serviceRequest);
        logger.info("Service request created with ID: {}", savedRequest.getId());
        return convertToDto(savedRequest);
    }

    @Transactional(readOnly = true)
    public ServiceRequestDTO getServiceRequestById(Long id) {
        ServiceRequest serviceRequest = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceException("ServiceRequest", "id", id.toString()));
        return convertToDto(serviceRequest);
    }

    @Transactional(readOnly = true)
    public List<ServiceRequestDTO> getAllServiceRequests() {
        return serviceRequestRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ServiceRequestDTO> getServiceRequestsByStatus(ServiceRequestStatus status) {
        return serviceRequestRepository.findByStatus(status).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ServiceRequestDTO updateServiceRequest(Long id, ServiceRequestUpdateDTO updateDTO) {
        ServiceRequest serviceRequest = serviceRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceException("ServiceRequest", "id", id.toString()));

        Optional.ofNullable(updateDTO.getDescription()).ifPresent(serviceRequest::setDescription);
        Optional.ofNullable(updateDTO.getWasteType()).ifPresent(serviceRequest::setWasteType);
        Optional.ofNullable(updateDTO.getEstimatedVolume()).ifPresent(serviceRequest::setEstimatedVolume);
        Optional.ofNullable(updateDTO.getPreferredDate()).ifPresent(serviceRequest::setPreferredDate);
        Optional.ofNullable(updateDTO.getPhone()).ifPresent(serviceRequest::setPhoneNumber);
        Optional.ofNullable(updateDTO.getAddress()).ifPresent(serviceRequest::setAddress);
        Optional.ofNullable(updateDTO.getComment()).ifPresent(serviceRequest::setComment);

        if (updateDTO.getCollectorId() != null) {
            Collector collector = collectorRepository.findById(updateDTO.getCollectorId())
                    .orElseThrow(() -> new ResourceException("Collector", "id", updateDTO.getCollectorId().toString()));
            serviceRequest.setCollector(collector);
            serviceRequest.setStatus(ServiceRequestStatus.ACCEPTED);
        }

        serviceRequest.setUpdatedAt(LocalDateTime.now());
        ServiceRequest updatedRequest = serviceRequestRepository.save(serviceRequest);
        logger.info("Service request ID: {} updated successfully.", id);
        return convertToDto(updatedRequest);
    }

    @Transactional
    public ServiceRequestDTO assignCollectorToServiceRequest(Long serviceRequestId, Long collectorId) {
        ServiceRequest serviceRequest = serviceRequestRepository.findById(serviceRequestId)
                .orElseThrow(() -> new ResourceException("ServiceRequest", "id", serviceRequestId.toString()));

        Collector collector = collectorRepository.findById(collectorId)
                .orElseThrow(() -> new ResourceException("Collector", "id", collectorId.toString()));

        serviceRequest.setCollector(collector);
        serviceRequest.setStatus(ServiceRequestStatus.ACCEPTED);
        serviceRequest.setUpdatedAt(LocalDateTime.now());
        ServiceRequest updatedRequest = serviceRequestRepository.save(serviceRequest);
        logger.info("Service request ID: {} assigned to collector ID: {}.", serviceRequestId, collectorId);
        return convertToDto(updatedRequest);
    }

    @Transactional
    public void completeServiceRequest(Long serviceRequestId) {
        ServiceRequest serviceRequest = serviceRequestRepository.findById(serviceRequestId)
                .orElseThrow(() -> new ResourceException("ServiceRequest", "id", serviceRequestId.toString()));

        if (serviceRequest.getStatus() != ServiceRequestStatus.IN_PROGRESS && serviceRequest.getStatus() != ServiceRequestStatus.ACCEPTED) {
            throw new IllegalStateException("Service request must be IN_PROGRESS or ACCEPTED to be completed.");
        }

        serviceRequest.setStatus(ServiceRequestStatus.COMPLETED);
        serviceRequest.setUpdatedAt(LocalDateTime.now());
        serviceRequestRepository.save(serviceRequest);
        logger.info("Service request ID: {} marked as COMPLETED.", serviceRequestId);
    }
    
    @Transactional
    public void startServiceRequest(Long serviceRequestId) {
        ServiceRequest serviceRequest = serviceRequestRepository.findById(serviceRequestId)
                .orElseThrow(() -> new ResourceException("ServiceRequest", "id", serviceRequestId.toString()));

        if (serviceRequest.getStatus() != ServiceRequestStatus.ACCEPTED) {
            throw new IllegalStateException("Service request must be ACCEPTED to be started.");
        }

        serviceRequest.setStatus(ServiceRequestStatus.IN_PROGRESS);
        serviceRequest.setUpdatedAt(LocalDateTime.now());
        serviceRequestRepository.save(serviceRequest);
        logger.info("Service request ID: {} marked as IN_PROGRESS.", serviceRequestId);
    }

    @Transactional
    public void cancelServiceRequest(Long serviceRequestId) {
        ServiceRequest serviceRequest = serviceRequestRepository.findById(serviceRequestId)
                .orElseThrow(() -> new ResourceException("ServiceRequest", "id", serviceRequestId.toString()));

        if (serviceRequest.getStatus() == ServiceRequestStatus.COMPLETED) {
            throw new IllegalStateException("Completed service requests cannot be cancelled.");
        }

        serviceRequest.setStatus(ServiceRequestStatus.CANCELLED);
        serviceRequest.setUpdatedAt(LocalDateTime.now());
        serviceRequestRepository.save(serviceRequest);
        logger.info("Service request ID: {} marked as CANCELLED.", serviceRequestId);
    }

    @Transactional
    public void deleteServiceRequest(Long id) {
        if (!serviceRequestRepository.existsById(id)) {
            throw new ResourceException("ServiceRequest", "id", id.toString());
        }
        serviceRequestRepository.deleteById(id);
        logger.info("Service request with ID {} deleted successfully.", id);
    }

    private ServiceRequestDTO convertToDto(ServiceRequest serviceRequest) {
        ServiceRequestDTO dto = new ServiceRequestDTO();
        dto.setId(serviceRequest.getId());
        dto.setDescription(serviceRequest.getDescription());
        dto.setWasteType(serviceRequest.getWasteType());
        dto.setEstimatedVolume(serviceRequest.getEstimatedVolume());
        dto.setPreferredDate(serviceRequest.getPreferredDate());
        dto.setStatus(serviceRequest.getStatus());
        dto.setCreatedAt(serviceRequest.getCreatedAt());
        dto.setUpdatedAt(serviceRequest.getUpdatedAt());
        dto.setPhone(serviceRequest.getPhoneNumber());
        dto.setAddress(serviceRequest.getAddress());
        dto.setComment(serviceRequest.getComment());

        if (serviceRequest.getHousehold() != null) {
            dto.setHouseholdAddress(serviceRequest.getHousehold().getAddress());
        }
        return dto;
    }
}