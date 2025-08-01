// File: com/wastecollect/backend/service/NotificationService.java
package com.wastecollect.backend.service;

import com.wastecollect.common.dto.NotificationDTO;
import com.wastecollect.common.models.Notification;
import com.wastecollect.common.models.User; // Assuming User model exists
import com.wastecollect.common.models.ServiceRequest; // Assuming ServiceRequest model exists
import com.wastecollect.common.models.Payment; // Assuming Payment model exists
import com.wastecollect.common.models.Dispute; // Assuming Dispute model exists
import com.wastecollect.backend.repository.NotificationRepository;
import com.wastecollect.backend.repository.UserRepository; // Assuming UserRepository exists for fetching User
import com.wastecollect.backend.exception.ResourceException; // Custom exception for resource not found
import com.wastecollect.common.utils.NotificationType;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // For transaction management
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service class for managing notifications.
 * Handles business logic related to creating, retrieving, and updating notifications.
 */
@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository; // Assuming you have a UserRepository to fetch User entities

    // You might also need repositories for ServiceRequest, Payment, Dispute
    // @Autowired private ServiceRequestRepository serviceRequestRepository;
    // @Autowired private PaymentRepository paymentRepository;
    // @Autowired private DisputeRepository disputeRepository;

    /**
     * Creates a new notification.
     *
     * @param notificationDTO The DTO containing notification details.
     * @return The created NotificationDTO with its generated ID.
     * @throws ResourceException if the recipient user is not found.
     */
    @Transactional
    public NotificationDTO createNotification(NotificationDTO notificationDTO) {
        logger.info("Attempting to create a new notification for recipient ID: {}", notificationDTO.getRecipientId());

        User recipient = userRepository.findById(notificationDTO.getRecipientId())
                .orElseThrow(() -> new ResourceException("User not found for recipient ID", notificationDTO.getRecipientId().toString()));

        // Fetch related entities if IDs are provided in the DTO
        ServiceRequest serviceRequest = null;
        if (notificationDTO.getServiceRequestId() != null) {
            // serviceRequest = serviceRequestRepository.findById(notificationDTO.getServiceRequestId()).orElse(null);
            // In a real app, you'd fetch the actual entity. For this example, assume it's valid or handle error.
            logger.warn("ServiceRequest entity fetching is commented out. ID: {}", notificationDTO.getServiceRequestId());
        }
        Payment payment = null;
        if (notificationDTO.getPaymentId() != null) {
            // payment = paymentRepository.findById(notificationDTO.getPaymentId()).orElse(null);
            logger.warn("Payment entity fetching is commented out. ID: {}", notificationDTO.getPaymentId());
        }
        Dispute dispute = null;
        if (notificationDTO.getDisputeId() != null) {
            // dispute = disputeRepository.findById(notificationDTO.getDisputeId()).orElse(null);
            logger.warn("Dispute entity fetching is commented out. ID: {}", notificationDTO.getDisputeId());
        }

        Notification newNotification = new Notification(
                recipient,
                notificationDTO.getSubject(),
                notificationDTO.getMessage(),
                notificationDTO.getNotificationType(),
                serviceRequest,
                payment,
                dispute
        );

        Notification savedNotification = notificationRepository.save(newNotification);
        logger.info("Notification created successfully with ID: {}", savedNotification.getId());
        return convertToDto(savedNotification);
    }

    /**
     * Retrieves a notification by its ID.
     *
     * @param id The ID of the notification.
     * @return The NotificationDTO.
     * @throws ResourceException if the notification is not found.
     */
    public NotificationDTO getNotificationById(Long id) {
        logger.info("Retrieving notification with ID: {}", id);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceException("Notification not found", id.toString()));
        return convertToDto(notification);
    }

    /**
     * Retrieves notifications for a specific user, with optional filters for read status and notification type,
     * with pagination.
     *
     * @param userId The ID of the recipient user.
     * @param isReadFilter Optional: True for read, False for unread, null for all.
     * @param typeFilter Optional: The NotificationType to filter by, null for all types.
     * @param pageable Pagination and sorting information.
     * @return A Page of NotificationDTOs.
     * @throws ResourceException if the user is not found.
     */
    public Page<NotificationDTO> getNotificationsForUser(
            Long userId,
            Boolean isReadFilter,
            NotificationType typeFilter,
            Pageable pageable) {
        logger.info("Retrieving notifications for user ID: {} with isReadFilter: {} and typeFilter: {}",
                userId, isReadFilter, typeFilter);
        User recipient = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceException("User not found", userId.toString()));

        // Ensure the query in NotificationRepository can handle nulls for optional filters
        Page<Notification> notifications = notificationRepository.findByRecipientAndFilters(
                recipient, isReadFilter, typeFilter, pageable);
        return notifications.map(this::convertToDto);
    }

    /**
     * Retrieves unread notifications for a specific user, with pagination.
     *
     * @param userId The ID of the recipient user.
     * @param pageable Pagination information.
     * @return A Page of unread NotificationDTOs.
     * @throws ResourceException if the user is not found.
     */
    public Page<NotificationDTO> getUnreadNotificationsForUser(Long userId, Pageable pageable) {
        logger.info("Retrieving unread notifications for user ID: {}", userId);
        User recipient = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceException("User not found", userId.toString()));

        Page<Notification> notifications = notificationRepository.findByRecipientAndIsRead(recipient, false, pageable);
        return notifications.map(this::convertToDto);
    }

    /**
     * Marks a specific notification as read.
     *
     * @param notificationId The ID of the notification to mark as read.
     * @return The updated NotificationDTO.
     * @throws ResourceException if the notification is not found.
     */
    @Transactional
    public NotificationDTO markNotificationAsRead(Long notificationId) {
        logger.info("Marking notification with ID: {} as read.", notificationId);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceException("Notification not found", notificationId.toString()));

        if (!notification.getIsRead()) {
            notification.markAsRead();
            Notification updatedNotification = notificationRepository.save(notification);
            logger.info("Notification ID: {} marked as read successfully.", notificationId);
            return convertToDto(updatedNotification);
        } else {
            logger.info("Notification ID: {} was already read.", notificationId);
            return convertToDto(notification);
        }
    }

    /**
     * Marks a specific notification as unread.
     *
     * @param notificationId The ID of the notification to mark as unread.
     * @return The updated NotificationDTO.
     * @throws ResourceException if the notification is not found.
     */
    @Transactional
    public NotificationDTO markNotificationAsUnread(Long notificationId) {
        logger.info("Marking notification with ID: {} as unread.", notificationId);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceException("Notification not found", notificationId.toString()));

        if (notification.getIsRead()) {
            notification.markAsUnread();
            Notification updatedNotification = notificationRepository.save(notification);
            logger.info("Notification ID: {} marked as unread successfully.", notificationId);
            return convertToDto(updatedNotification);
        } else {
            logger.info("Notification ID: {} was already unread.", notificationId);
            return convertToDto(notification);
        }
    }

    /**
     * Marks all unread notifications for a specific user as read.
     *
     * @param userId The ID of the user whose notifications should be marked as read.
     * @return The count of notifications marked as read.
     * @throws ResourceException if the user is not found.
     */
    @Transactional
    public long markAllNotificationsAsReadForUser(Long userId) {
        logger.info("Marking all unread notifications as read for user ID: {}", userId);
        User recipient = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceException("User not found", userId.toString()));

        List<Notification> unreadNotifications = notificationRepository.findByRecipientAndIsRead(recipient, false, Pageable.unpaged()).getContent();
        unreadNotifications.forEach(Notification::markAsRead);
        notificationRepository.saveAll(unreadNotifications); // Save all updated notifications
        logger.info("{} notifications marked as read for user ID: {}", unreadNotifications.size(), userId);
        return unreadNotifications.size();
    }

    /**
     * Deletes a notification by its ID.
     *
     * @param id The ID of the notification to delete.
     * @throws ResourceException if the notification is not found.
     */
    @Transactional
    public void deleteNotification(Long id) {
        logger.info("Attempting to delete notification with ID: {}", id);
        if (!notificationRepository.existsById(id)) {
            throw new ResourceException("Notification not found", id.toString());
        }
        notificationRepository.deleteById(id);
        logger.info("Notification with ID: {} deleted successfully.", id);
    }

    /**
     * Retrieves the current security alert status (latest unread ALERT type notification).
     *
     * @return The latest unread NotificationDTO of type ALERT, or null if no such alert is found.
     */
    public NotificationDTO getAlertStatus() {
        logger.info("Retrieving current security alert status (latest unread ALERT type notification).");
        // This method assumes you want a specific "alert" which is an unread notification of type ALERT
        // You might need a more specific query in the repository if 'ALERT' is not the only criterion.
        Optional<Notification> latestUnreadAlert = notificationRepository.findTopByIsReadFalseOrderByCreatedAtDesc();

        if (latestUnreadAlert.isPresent()) {
            Notification alert = latestUnreadAlert.get();
            // Optional: Filter by NotificationType.ALERT if you only want alerts
            if (alert.getNotificationType() == NotificationType.ALERT) {
                logger.debug("Found unread alert: {}", alert.getSubject());
                return convertToDto(alert);
            }
        }
        logger.info("No unread security alerts of type ALERT found.");
        return null; // Return null if no alert is found
    }

    /**
     * Helper method to convert a Notification entity to a NotificationDTO.
     *
     * @param notification The Notification entity.
     * @return The corresponding NotificationDTO.
     */
    private NotificationDTO convertToDto(Notification notification) {
        if (notification == null) {
            return null;
        }
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
        return dto;
    }
}
