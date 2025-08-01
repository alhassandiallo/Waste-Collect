package com.wastecollect.backend.service;

import com.wastecollect.common.dto.*;
import com.wastecollect.common.models.*;
import com.wastecollect.common.utils.NotificationType;
import com.wastecollect.common.utils.ServiceRequestStatus;
import com.wastecollect.backend.repository.CollectorRepository;
import com.wastecollect.backend.repository.ServiceRequestRepository;
import com.wastecollect.backend.repository.PaymentRepository;
import com.wastecollect.backend.repository.NotificationRepository;
import com.wastecollect.backend.repository.RatingRepository;
import com.wastecollect.backend.repository.WasteCollectionRepository;
import com.wastecollect.backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CollectorService {

    private static final Logger logger = LoggerFactory.getLogger(CollectorService.class);

    @Autowired
    private CollectorRepository collectorRepository;

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private WasteCollectionRepository wasteCollectionRepository;

    // Helper method to get the current authenticated Collector user
    private Optional<Collector> getCurrentCollector() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("No authenticated user found in security context for collector.");
            return Optional.empty();
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            String username = ((UserDetails) principal).getUsername();
            // Fetch the Collector from the repository to ensure it's a managed entity
            // and relationships are properly initialized (e.g., Municipality).
            // Consider using a custom query in CollectorRepository if eager fetching is needed here.
            return collectorRepository.findByEmail(username);
        } else if (principal instanceof Collector) {
            // This case might occur if the principal is already the full Collector object
            // from a custom UserDetailsService that returns the entity directly.
            return Optional.of((Collector) principal);
        }
        logger.warn("Authenticated principal is not a UserDetails or Collector instance.");
        return Optional.empty();
    }

    /**
     * Retrieves comprehensive performance summary for the authenticated collector.
     * This method is intended for both CollectorDashboard and PerformanceMetrics.
     *
     * @return A CollectorDashboardSummaryDTO containing general statistics.
     * @throws IllegalStateException if the authenticated collector is not found.
     */
    public CollectorDashboardSummaryDTO getPerformanceIndicators() {
        Collector collector = getCurrentCollector()
                .orElseThrow(() -> new IllegalStateException("Authenticated collector not found."));

        long totalRequests = serviceRequestRepository.countByCollector(collector);
        long pendingRequests = serviceRequestRepository.countByCollectorAndStatus(collector, ServiceRequestStatus.PENDING);
        long completedToday = serviceRequestRepository.countByCollectorAndStatusAndCreatedAtAfter(
            collector, ServiceRequestStatus.COMPLETED, LocalDate.now().atStartOfDay()
        );
        double totalRevenue = paymentRepository.findByCollector(collector).stream()
                                .mapToDouble(Payment::getAmount).sum();

        // Calculate weekly revenue
        double weeklyRevenue = paymentRepository.findByCollectorAndPaymentDateBetween(
            collector,
            LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay(),
            LocalDateTime.now()
        ).stream().mapToDouble(Payment::getAmount).sum();

        Double averageRating = ratingRepository.findByCollector(collector).stream()
                                .mapToInt(CollectorRating::getOverallRating)
                                .average()
                                .orElse(0.0);
        long totalRatings = ratingRepository.countByCollector(collector);

        // Assuming totalHouseholds and completionRate for generalStats in PerformanceMetrics
        long totalHouseholds = serviceRequestRepository.countDistinctHouseholdsByCollector(collector); // You might need a custom query in ServiceRequestRepository
        double completionRate = (totalRequests == 0) ? 0 : (double) serviceRequestRepository.countByCollectorAndStatus(collector, ServiceRequestStatus.COMPLETED) / totalRequests * 100;

        // Return the new DTO
        return new CollectorDashboardSummaryDTO(
                totalRequests,
                pendingRequests,
                completedToday,
                totalRevenue,
                weeklyRevenue,
                averageRating,
                totalRatings,
                totalHouseholds, // Added totalHouseholds
                completionRate // Added completionRate
        );
    }

    /**
     * Retrieves detailed performance data for charts for the authenticated collector.
     *
     * @param period The period for which to retrieve data (e.g., "DAY", "WEEK", "MONTH", "YEAR").
     * @return A Map containing performance data for charting.
     * @throws IllegalStateException if the authenticated collector is not found.
     */
    public Map<String, List<?>> getCollectorPerformanceData(String period) {
        Collector collector = getCurrentCollector()
                .orElseThrow(() -> new IllegalStateException("Authenticated collector not found."));

        LocalDateTime now = LocalDateTime.now();
        List<Double> collectionsData = new ArrayList<>();
        List<Double> revenueData = new ArrayList<>();
        List<String> labels = new ArrayList<>();

        switch (period.toUpperCase()) {
            case "DAY": // Data for the last 7 days
                for (int i = 6; i >= 0; i--) {
                    LocalDateTime startOfDay = now.minusDays(i).toLocalDate().atStartOfDay();
                    LocalDateTime endOfDay = startOfDay.plusDays(1).minusNanos(1);
                    long completed = serviceRequestRepository.countByCollectorAndStatusAndCreatedAtBetween(
                        collector, ServiceRequestStatus.COMPLETED, startOfDay, endOfDay
                    );
                    double revenue = paymentRepository.findByCollectorAndPaymentDateBetween(
                        collector, startOfDay, endOfDay
                    ).stream().mapToDouble(Payment::getAmount).sum();

                    collectionsData.add((double) completed);
                    revenueData.add(revenue);
                    labels.add(startOfDay.toLocalDate().getDayOfWeek().name().substring(0, 3)); // Mon, Tue, etc.
                }
                break;
            case "WEEK": // Data for the last 4 weeks
                for (int i = 3; i >= 0; i--) {
                    LocalDateTime startOfWeek = now.minusWeeks(i).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).toLocalDate().atStartOfDay();
                    LocalDateTime endOfWeek = startOfWeek.plusWeeks(1).minusNanos(1);
                    long completed = serviceRequestRepository.countByCollectorAndStatusAndCreatedAtBetween(
                        collector, ServiceRequestStatus.COMPLETED, startOfWeek, endOfWeek
                    );
                    double revenue = paymentRepository.findByCollectorAndPaymentDateBetween(
                        collector, startOfWeek, endOfWeek
                    ).stream().mapToDouble(Payment::getAmount).sum();

                    collectionsData.add((double) completed);
                    revenueData.add(revenue);
                    labels.add("Week " + (now.minusWeeks(i).getDayOfYear())); // Week number
                }
                break;
            case "MONTH": // Data for the last 12 months
                for (int i = 11; i >= 0; i--) {
                    LocalDateTime startOfMonth = now.minusMonths(i).with(TemporalAdjusters.firstDayOfMonth()).toLocalDate().atStartOfDay();
                    LocalDateTime endOfMonth = startOfMonth.plusMonths(1).minusNanos(1);
                    long completed = serviceRequestRepository.countByCollectorAndStatusAndCreatedAtBetween(
                        collector, ServiceRequestStatus.COMPLETED, startOfMonth, endOfMonth
                    );
                    double revenue = paymentRepository.findByCollectorAndPaymentDateBetween(
                        collector, startOfMonth, endOfMonth
                    ).stream().mapToDouble(Payment::getAmount).sum();

                    collectionsData.add((double) completed);
                    revenueData.add(revenue);
                    labels.add(startOfMonth.toLocalDate().getMonth().name().substring(0, 3)); // Jan, Feb, etc.
                }
                break;
            case "YEAR": // Data for the last 3 years
                for (int i = 2; i >= 0; i--) {
                    LocalDateTime startOfYear = now.minusYears(i).with(TemporalAdjusters.firstDayOfYear()).toLocalDate().atStartOfDay();
                    LocalDateTime endOfYear = startOfYear.plusYears(1).minusNanos(1);
                    long completed = serviceRequestRepository.countByCollectorAndStatusAndCreatedAtBetween(
                        collector, ServiceRequestStatus.COMPLETED, startOfYear, endOfYear
                    );
                    double revenue = paymentRepository.findByCollectorAndPaymentDateBetween(
                        collector, startOfYear, endOfYear
                    ).stream().mapToDouble(Payment::getAmount).sum();

                    collectionsData.add((double) completed);
                    revenueData.add(revenue);
                    labels.add(String.valueOf(startOfYear.getYear())); // Year
                }
                break;
            default:
                // Return empty data for unknown periods
                break;
        }

        return Map.of(
            "collectionsData", collectionsData,
            "revenueData", revenueData,
            "labels", labels
        );
    }

    /**
     * Retrieves objectives for the authenticated collector.
     *
     * @return An ObjectiveDTO containing the collector's objectives and current progress.
     * @throws IllegalStateException if the authenticated collector is not found.
     */
    public ObjectiveDTO getCollectorObjectives() {
        Collector collector = getCurrentCollector()
                .orElseThrow(() -> new IllegalStateException("Authenticated collector not found."));

        // Placeholder for real objective values from configuration or admin settings
        int monthlyTargetCollections = 100;
        double monthlyTargetRevenue = 500000.0;
        double targetRating = 4.5;

        // Calculate current progress for the current month
        LocalDateTime startOfMonth = LocalDateTime.now().with(TemporalAdjusters.firstDayOfMonth()).toLocalDate().atStartOfDay();
        LocalDateTime endOfMonth = LocalDateTime.now().with(TemporalAdjusters.lastDayOfMonth()).toLocalDate().atStartOfDay().plusDays(1).minusNanos(1);

        long currentCollectionsProgress = serviceRequestRepository.countByCollectorAndStatusAndCreatedAtBetween(
            collector, ServiceRequestStatus.COMPLETED, startOfMonth, endOfMonth
        );

        double currentRevenueProgress = paymentRepository.findByCollectorAndPaymentDateBetween(
            collector,
            startOfMonth,
            endOfMonth
        ).stream().mapToDouble(Payment::getAmount).sum();

        Double currentRating = ratingRepository.findByCollector(collector).stream()
                .mapToInt(CollectorRating::getOverallRating)
                .average()
                .orElse(0.0);

        return new ObjectiveDTO(
            monthlyTargetCollections,
            (int) currentCollectionsProgress,
            monthlyTargetRevenue,
            currentRevenueProgress,
            targetRating,
            currentRating
        );
    }

    /**
     * Retrieves recent household feedback for the authenticated collector.
     *
     * @param limit The maximum number of feedback entries to retrieve.
     * @return A list of HouseholdFeedbackDTOs.
     * @throws IllegalStateException if the authenticated collector is not found.
     */
    public List<HouseholdFeedbackDTO> getRecentHouseholdFeedback(int limit) {
        Collector collector = getCurrentCollector()
                .orElseThrow(() -> new IllegalStateException("Authenticated collector not found."));

        // You might need a custom query in RatingRepository to order by ratingDateDesc and limit
        List<CollectorRating> recentRatings = ratingRepository.findByCollectorOrderByRatingDateDesc(collector);

        return recentRatings.stream()
                .limit(limit)
                .map(rating -> new HouseholdFeedbackDTO(
                    rating.getId(),
                    rating.getHousehold() != null ? rating.getHousehold().getFirstName() + " " + rating.getHousehold().getLastName() : "Anonymous",
                    rating.getOverallRating(),
                    rating.getComment(),
                    "Waste Collection", // Or derive from related service request if available
                    rating.getRatingDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all security alerts relevant to the authenticated collector.
     * Now uses the Notification entity.
     *
     * @return A list of NotificationDTOs (mapped from Notification entities).
     * @throws IllegalStateException if the authenticated collector is not found.
     */
    public List<NotificationDTO> getSecurityAlertsForCollector() {
        Collector collector = getCurrentCollector()
                .orElseThrow(() -> new IllegalStateException("Authenticated collector not found."));

        List<Notification> alerts = notificationRepository.findByRecipientAndNotificationTypeOrderByCreatedAtDesc(collector, NotificationType.ALERT);

        return alerts.stream()
                .map(this::convertToNotificationDTO)
                .collect(Collectors.toList());
    }

    /**
     * Converts a Notification entity to a NotificationDTO.
     * @param notification The Notification entity.
     * @return The corresponding NotificationDTO.
     */
    private NotificationDTO convertToNotificationDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setRecipientId(notification.getRecipient() != null ? notification.getRecipient().getId() : null);
        dto.setSubject(notification.getSubject());
        dto.setMessage(notification.getMessage());
        dto.setNotificationType(notification.getNotificationType());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setReadAt(notification.getReadAt());
        dto.setIsRead(notification.getIsRead());
        dto.setServiceRequestId(notification.getServiceRequest() != null ? notification.getServiceRequest().getId() : null);
        dto.setPaymentId(notification.getPayment() != null ? notification.getPayment().getId() : null);
        dto.setDisputeId(notification.getDispute() != null ? notification.getDispute().getId() : null);
        // Assuming 'title' for alerts on frontend maps to 'subject'
        // Assuming 'priority' on frontend maps to 'notificationType' for visual variant
        // You might want to add a real 'priority' field to Notification if needed.
        return dto;
    }

    /**
     * Retrieves mobile payment history for the authenticated collector.
     *
     * @return A list of PaymentDTOs.
     * @throws IllegalStateException if the authenticated collector is not found.
     */
    public List<PaymentDTO> getMobilePayments() {
        Collector collector = getCurrentCollector()
                                  .orElseThrow(() -> new IllegalStateException("Authenticated collector not found."));

        List<Payment> payments = paymentRepository.findByCollector(collector);
        return payments.stream()
                .map(payment -> {
                    PaymentDTO dto = new PaymentDTO();
                    dto.setId(payment.getId());
                    dto.setAmount(payment.getAmount());
                    dto.setPaymentMethod(payment.getPaymentMethod());
                    dto.setStatus(payment.getStatus());
                    dto.setPaymentDate(payment.getPaymentDate());
                    dto.setTransactionReference(payment.getTransactionReference());
                    dto.setHouseholdId(payment.getHousehold() != null ? payment.getHousehold().getId() : null);
                    dto.setServiceRequestId(payment.getServiceRequest() != null ? payment.getServiceRequest().getId() : null);
                    dto.setCollectorId(payment.getCollector() != null ? payment.getCollector().getId() : null);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * Sends a security alert.
     * Now creates a Notification entity of type ALERT.
     *
     * @param alertDto The NotificationDTO containing alert information.
     * @throws IllegalStateException if the authenticated collector is not found.
     */
    public void sendSecurityAlert(NotificationDTO alertDto) {
        logger.info("Attempting to send security alert: {}", alertDto.getSubject());
        Collector sender = getCurrentCollector()
                .orElseThrow(() -> new IllegalStateException("Authenticated collector not found. Cannot send alert."));

        User recipientUser = sender; // Default to sender for now, or fetch a specific admin user

        Notification alert = new Notification(
            recipientUser,
            alertDto.getSubject(),
            alertDto.getMessage(),
            NotificationType.ALERT,
            null, null, null
        );
        alert.setIsRead(false);

        notificationRepository.save(alert);
        logger.info("Security alert '{}' saved successfully.", alertDto.getSubject());
    }

    /**
     * Retrieves the current security alert status (single notification).
     * This method is likely for a quick dashboard summary, not a list.
     *
     * @return A NotificationDTO representing the latest unread alert, or null if no alert is found.
     */
    public NotificationDTO getNotificationStatus() {
        logger.info("Retrieving current security alert status.");
        Optional<Notification> latestUnreadAlert = notificationRepository.findTopByIsReadFalseAndNotificationTypeOrderByCreatedAtDesc(NotificationType.ALERT);
        if (latestUnreadAlert.isPresent()) {
            Notification alert = latestUnreadAlert.get();
            logger.debug("Found unread alert: {}", alert.getSubject());
            return convertToNotificationDTO(alert);
        }
        logger.info("No unread security alerts found.");
        return null;
    }

    /**
     * Rejects a service request with a provided rejection note.
     * Updates the request status to 'REJECTED'.
     *
     * @param requestId     The ID of the service request to reject.
     * @param actionDto     DTO containing the rejection reason.
     * @throws ResourceNotFoundException if the service request is not found.
     * @throws IllegalStateException if the authenticated collector is not found or not assigned.
     */
    @Transactional
    public void rejectServiceRequest(Long requestId, ServiceRequestActionDTO actionDto) {
        Collector collector = getCurrentCollector()
                .orElseThrow(() -> new IllegalStateException("Authenticated collector not found."));

        logger.info("Attempting to reject service request with ID: {}", requestId);
        ServiceRequest request = serviceRequestRepository.findById(requestId)
                                    .orElseThrow(() -> {
                                        logger.warn("Service request not found for rejection with ID: {}", requestId);
                                        return new ResourceNotFoundException("Service request not found with ID: " + requestId);
                                    });

        if (request.getCollector() != null && !request.getCollector().equals(collector)) {
            throw new IllegalStateException("You are not authorized to reject this service request.");
        }

        request.setStatus(ServiceRequestStatus.REJECTED);
        request.setComment(actionDto.getReason());
        request.setUpdatedAt(LocalDateTime.now());
        serviceRequestRepository.save(request);
        logger.info("Service request with ID: {} rejected successfully with note: {}", requestId, actionDto.getReason());

        if (request.getHousehold() != null) {
            Notification notification = new Notification(
                request.getHousehold(),
                "Service Request Rejected",
                "Your service request (ID: " + requestId + ") was rejected due to: " + actionDto.getReason(),
                NotificationType.SERVICE_REQUEST_UPDATE,
                request, null, null
            );
            notificationRepository.save(notification);
        }
    }

    /**
     * Marks a security alert (Notification) as read.
     *
     * @param alertId The ID of the alert to mark as read.
     * @throws ResourceNotFoundException if the alert is not found.
     * @throws IllegalStateException if the authenticated collector is not found or not the recipient.
     */
    @Transactional
    public void markSecurityAlertAsRead(Long alertId) {
        logger.info("Attempting to mark security alert (Notification) with ID: {} as read.", alertId);
        Collector collector = getCurrentCollector()
                .orElseThrow(() -> new IllegalStateException("Authenticated collector not found. Cannot mark alert as read."));

        Notification alert = notificationRepository.findById(alertId)
                                    .orElseThrow(() -> {
                                        logger.warn("Security alert (Notification) not found for marking as read with ID: {}", alertId);
                                        return new ResourceNotFoundException("Security alert not found with ID: " + alertId);
                                    });

        if (alert.getRecipient() == null || !alert.getRecipient().equals(collector)) {
             throw new IllegalStateException("You are not authorized to mark this alert as read.");
        }

        alert.markAsRead();
        notificationRepository.save(alert);
        logger.info("Security alert (Notification) with ID: {} marked as read successfully.", alertId);
    }

    /**
     * Retrieves all pending, accepted, and in-progress service requests for the authenticated collector.
     *
     * @return A list of ServiceRequestDTOs.
     * @throws IllegalStateException if the authenticated collector is not found.
     */
    public List<ServiceRequestDTO> getRequestsForAuthenticatedCollector() {
        Collector collector = getCurrentCollector()
                .orElseThrow(() -> new IllegalStateException("Authenticated collector not found."));

        List<ServiceRequest> requests = serviceRequestRepository.findByCollectorAndStatusIn(
            collector, List.of(ServiceRequestStatus.ACCEPTED, ServiceRequestStatus.IN_PROGRESS)
        );
        requests.addAll(serviceRequestRepository.findByStatus(ServiceRequestStatus.PENDING));

        return requests.stream()
                .map(this::convertToServiceRequestDTO)
                .collect(Collectors.toList());
    }

    /**
     * Allows the authenticated collector to accept a service request.
     *
     * @param serviceRequestId The ID of the service request to accept.
     * @param actionDto        DTO containing notes for acceptance.
     * @throws IllegalStateException if the collector is not found or request cannot be accepted.
     * @throws ResourceNotFoundException if the service request is not found.
     */
    @Transactional
    public void acceptServiceRequest(Long serviceRequestId, ServiceRequestActionDTO actionDto) {
        Collector collector = getCurrentCollector()
                .orElseThrow(() -> new IllegalStateException("Authenticated collector not found."));

        ServiceRequest serviceRequest = serviceRequestRepository.findById(serviceRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Service Request not found."));

        if (serviceRequest.getStatus() != ServiceRequestStatus.PENDING) {
            throw new IllegalStateException("Service Request is not in PENDING status and cannot be accepted.");
        }

        serviceRequest.setStatus(ServiceRequestStatus.ACCEPTED);
        serviceRequest.setCollector(collector);
        serviceRequest.setComment(actionDto.getNote());
        serviceRequest.setUpdatedAt(LocalDateTime.now());
        serviceRequestRepository.save(serviceRequest);
        logger.info("Collector ID: {} accepted service request ID: {} with note: {}", collector.getId(), serviceRequestId, actionDto.getNote());

        if (serviceRequest.getHousehold() != null) {
            Notification notification = new Notification(
                serviceRequest.getHousehold(),
                "Service Request Accepted",
                "Your service request (ID: " + serviceRequestId + ") has been accepted by " + collector.getFirstName() + " " + collector.getLastName() + ". Expected collection date: " + serviceRequest.getPreferredDate().toLocalDate(),
                NotificationType.SERVICE_REQUEST_UPDATE,
                serviceRequest, null, null
            );
            notificationRepository.save(notification);
        }
    }

    /**
     * Allows the authenticated collector to mark a service request as in progress.
     *
     * @param serviceRequestId The ID of the service request to start.
     * @throws IllegalStateException if the collector is not found or request cannot be started.
     * @throws ResourceNotFoundException if the service request is not found.
     */
    @Transactional
    public void startServiceRequest(Long serviceRequestId) {
        Collector collector = getCurrentCollector()
                .orElseThrow(() -> new IllegalStateException("Authenticated collector not found."));

        ServiceRequest serviceRequest = serviceRequestRepository.findById(serviceRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Service Request not found."));

        if (serviceRequest.getStatus() != ServiceRequestStatus.ACCEPTED) {
            throw new IllegalStateException("Service Request is not in ACCEPTED status and cannot be started.");
        }
        if (serviceRequest.getCollector() == null || !serviceRequest.getCollector().equals(collector)) {
            throw new IllegalStateException("Service Request is not assigned to this collector.");
        }

        serviceRequest.setStatus(ServiceRequestStatus.IN_PROGRESS);
        serviceRequest.setUpdatedAt(LocalDateTime.now());
        serviceRequestRepository.save(serviceRequest);
        logger.info("Collector ID: {} started service request ID: {}", collector.getId(), serviceRequestId);

        if (serviceRequest.getHousehold() != null) {
            Notification notification = new Notification(
                serviceRequest.getHousehold(),
                "Service Request In Progress",
                "Your service request (ID: " + serviceRequestId + ") is now in progress. The collector is on their way.",
                NotificationType.SERVICE_REQUEST_UPDATE,
                serviceRequest, null, null
            );
            notificationRepository.save(notification);
        }
    }

    /**
     * Allows the authenticated collector to mark a service request as completed.
     * Also creates a WasteCollection record.
     *
     * @param serviceRequestId The ID of the service request to complete.
     * @param actionDto        DTO containing notes for completion (e.g., actual weight, comments).
     * @throws IllegalStateException if the collector is not found or request cannot be completed.
     * @throws ResourceNotFoundException if the service request is not found.
     */
    @Transactional
    public void completeServiceRequest(Long serviceRequestId, ServiceRequestActionDTO actionDto) {
        Collector collector = getCurrentCollector()
                .orElseThrow(() -> new IllegalStateException("Authenticated collector not found."));

        ServiceRequest serviceRequest = serviceRequestRepository.findById(serviceRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Service Request not found."));

        if (serviceRequest.getStatus() != ServiceRequestStatus.IN_PROGRESS) {
            throw new IllegalStateException("Service Request is not in IN_PROGRESS status and cannot be completed.");
        }
        if (serviceRequest.getCollector() == null || !serviceRequest.getCollector().equals(collector)) {
            throw new IllegalStateException("Service Request is not assigned to this collector.");
        }

        serviceRequest.setStatus(ServiceRequestStatus.COMPLETED);
        serviceRequest.setComment(actionDto.getNote());
        serviceRequest.setUpdatedAt(LocalDateTime.now());
        serviceRequestRepository.save(serviceRequest);

        WasteCollection wasteCollection = new WasteCollection();
        wasteCollection.setServiceRequest(serviceRequest);
        wasteCollection.setCollector(collector);
        wasteCollection.setHousehold(serviceRequest.getHousehold());
        wasteCollection.setMunicipality(serviceRequest.getMunicipality());
        wasteCollection.setCollectionDate(LocalDateTime.now());
        wasteCollection.setAddresse(serviceRequest.getAddress());
        wasteCollection.setLatitude(actionDto.getLatitude()); // Use latitude from actionDto
        wasteCollection.setLongitude(actionDto.getLongitude()); // Use longitude from actionDto
        wasteCollection.setActualWeight(actionDto.getActualWeight()); // Use actualWeight from actionDto
        wasteCollection.setCollectorComment(actionDto.getNote());
        wasteCollection.setStatus(ServiceRequestStatus.COMPLETED);

        wasteCollectionRepository.save(wasteCollection);

        logger.info("Collector ID: {} completed service request ID: {} with notes: {}", collector.getId(), serviceRequestId, actionDto.getNote());

        if (serviceRequest.getHousehold() != null) {
            Notification notification = new Notification(
                serviceRequest.getHousehold(),
                "Service Request Completed",
                "Your service request (ID: " + serviceRequestId + ") has been successfully completed by " + collector.getFirstName() + " " + collector.getLastName() + ". Thank you!",
                NotificationType.SERVICE_REQUEST_UPDATE,
                serviceRequest, null, null
            );
            notificationRepository.save(notification);
        }
    }

    public List<ServiceRequestDTO> getRealTimeServiceRequests() {
        List<ServiceRequest> pendingAndAcceptedRequests = serviceRequestRepository.findByStatus(ServiceRequestStatus.PENDING);
        pendingAndAcceptedRequests.addAll(serviceRequestRepository.findByStatus(ServiceRequestStatus.ACCEPTED));

        return pendingAndAcceptedRequests.stream()
                .map(this::convertToServiceRequestDTO)
                .collect(Collectors.toList());
    }

    /**
     * Converts a ServiceRequest entity to the provided ServiceRequestDTO.
     * This method now correctly populates all fields of the provided ServiceRequestDTO.java.
     * @param serviceRequest The ServiceRequest entity.
     * @return The corresponding ServiceRequestDTO.
     */
    private ServiceRequestDTO convertToServiceRequestDTO(ServiceRequest serviceRequest) {
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
            HouseholdDTO householdDTO = new HouseholdDTO();
            householdDTO.setId(serviceRequest.getHousehold().getId());
            householdDTO.setFirstName(serviceRequest.getHousehold().getFirstName());
            householdDTO.setLastName(serviceRequest.getHousehold().getLastName());
            householdDTO.setEmail(serviceRequest.getHousehold().getEmail());
            householdDTO.setPhoneNumber(serviceRequest.getHousehold().getPhoneNumber());
            householdDTO.setAddress(serviceRequest.getHousehold().getAddress());
            householdDTO.setHousingType(serviceRequest.getHousehold().getHousingType());
            dto.setHousehold(householdDTO);
            dto.setHouseholdAddress(serviceRequest.getHousehold().getAddress());
        }
        return dto;
    }

    /**
     * Retrieves the profile of the authenticated collector.
     *
     * @return A CollectorProfileDTO containing the collector's profile information.
     * @throws IllegalStateException if the authenticated collector is not found.
     */
    public CollectorProfileDTO getCollectorProfile() {
        Collector collector = getCurrentCollector()
                .orElseThrow(() -> new IllegalStateException("Authenticated collector not found."));

        return new CollectorProfileDTO(
                collector.getId(),
                collector.getFirstName() != null ? collector.getFirstName() : "",
                collector.getLastName() != null ? collector.getLastName() : "",
                collector.getEmail() != null ? collector.getEmail() : "",
                collector.getPhoneNumber() != null ? collector.getPhoneNumber() : "",
                collector.getAddress() != null ? collector.getAddress() : "",
                collector.getCollectorId() != null ? collector.getCollectorId() : "",
                collector.getStatus() != null ? collector.getStatus() : null,
                collector.getMunicipality() != null ? collector.getMunicipality().getMunicipalityName() : null
        );
    }

    /**
     * Updates the profile of the authenticated collector.
     *
     * @param profileUpdateDto DTO containing the updated profile information.
     * @throws IllegalStateException if the authenticated collector is not found.
     * @throws ResourceNotFoundException if the collector to update is not found (should not happen for authenticated user).
     */
    @Transactional
    public void updateCollectorProfile(CollectorUpdateDTO profileUpdateDto) {
        Collector collector = getCurrentCollector()
                .orElseThrow(() -> new IllegalStateException("Authenticated collector not found. Cannot update profile."));

        // Update fields from the DTO
        collector.setFirstName(profileUpdateDto.getFirstName());
        collector.setLastName(profileUpdateDto.getLastName());
        collector.setEmail(profileUpdateDto.getEmail());
        collector.setPhoneNumber(profileUpdateDto.getPhoneNumber());
        collector.setAddress(profileUpdateDto.getAddress());
        collector.setStatus(profileUpdateDto.getStatus());

        collectorRepository.save(collector);
        logger.info("Collector profile updated for ID: {}", collector.getId());
    }
}
