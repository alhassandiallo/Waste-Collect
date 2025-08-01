// File: com/wastecollect/backend/repository/NotificationRepository.java
package com.wastecollect.backend.repository;

import com.wastecollect.common.models.Dispute;
import com.wastecollect.common.models.Notification;
import com.wastecollect.common.models.Role; // This import might not be needed if Role isn't used elsewhere
import com.wastecollect.common.models.User;
import com.wastecollect.common.utils.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

/**
 * Spring Data JPA Repository for Notification entities.
 * Provides methods for database operations related to notifications.
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Finds all notifications for a specific recipient, with pagination.
     *
     * @param recipient The User entity who is the recipient.
     * @param pageable Pagination information.
     * @return A Page of Notification entities for the given recipient.
     */
    Page<Notification> findByRecipient(User recipient, Pageable pageable);

    /**
     * Finds all unread notifications for a specific recipient, with pagination.
     *
     * @param recipient The User entity who is the recipient.
     * @param isRead Boolean indicating if the notification is read (false for unread).
     * @param pageable Pagination information.
     * @return A Page of unread Notification entities for the given recipient.
     */
    Page<Notification> findByRecipientAndIsRead(User recipient, Boolean isRead, Pageable pageable);

    /**
     * Finds all notifications for a specific recipient, filtered by read status and notification type, with pagination.
     *
     * @param recipient The User entity who is the recipient.
     * @param isRead Boolean indicating if the notification is read (true for read, false for unread, null for all).
     * @param notificationType The type of notification to filter by (e.g., NotificationType.ALERT). Null for all types.
     * @param pageable Pagination information.
     * @return A Page of Notification entities matching the criteria.
     */
    @Query(
        "SELECT n FROM Notification n WHERE n.recipient = :recipient " +
        "AND (:isRead IS NULL OR n.isRead = :isRead) " +
        "AND (:notificationType IS NULL OR n.notificationType = :notificationType)"
    )
    Page<Notification> findByRecipientAndFilters(User recipient, Boolean isRead, NotificationType notificationType, Pageable pageable);

    /**
     * Finds the latest (most recently created) unread notification.
     * Useful for displaying a single "current alert".
     *
     * @return An Optional containing the latest unread Notification, or empty if none found.
     */
    Optional<Notification> findTopByIsReadFalseOrderByCreatedAtDesc();

    /**
     * Counts the number of unread notifications for a specific recipient.
     *
     * @param recipient The User entity who is the recipient.
     * @return The count of unread notifications.
     */
    long countByRecipientAndIsReadFalse(User recipient);

    /**
     * Finds notifications by type for a specific recipient, with pagination.
     *
     * @param recipient The User entity who is the recipient.
     * @param notificationType The type of notification to filter by.
     * @param pageable Pagination information.
     * @return A Page of Notification entities matching the type and recipient.
     */
    Page<Notification> findByRecipientAndNotificationType(User recipient, NotificationType notificationType, Pageable pageable);

    /**
     * Finds all notifications related to a specific service request.
     *
     * @param serviceRequest The ServiceRequest entity.
     * @return A list of notifications linked to the service request.
     */
    List<Notification> findByServiceRequest(com.wastecollect.common.models.ServiceRequest serviceRequest);

    /**
     * Finds all notifications related to a specific payment.
     *
     * @param payment The Payment entity.
     * @return A list of notifications linked to the payment.
     */
    List<Notification> findByPayment(com.wastecollect.common.models.Payment payment);

    /**
     * Finds all notifications related to a specific dispute.
     *
     * @param dispute The Dispute entity.
     * @return A list of notifications linked to the dispute.
     */
    List<Notification> findByDispute(com.wastecollect.common.models.Dispute dispute);

    // Find all notifications of a specific type for a recipient, ordered by creation date
    List<Notification> findByRecipientAndNotificationTypeOrderByCreatedAtDesc(User recipient, NotificationType notificationType);

    // Find the latest unread notification of a specific type
    Optional<Notification> findTopByIsReadFalseAndNotificationTypeOrderByCreatedAtDesc(NotificationType notificationType);

    // Find all notifications for a recipient, regardless of type
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);

    /**
     * Finds all notifications of a specific type that are unread, ordered by creation date descending.
     * This is useful for system alerts.
     * @param notificationType The type of notification (e.g., NotificationType.ALERT).
     * @return A list of unread Notification entities.
     */
    List<Notification> findByNotificationTypeAndIsReadFalseOrderByCreatedAtDesc(NotificationType notificationType);

    /**
     * Finds the top 5 notifications of specific types, ordered by creation date descending.
     * This method was corrected to return `List<Notification>` and use `notificationTypes` as the parameter name.
     * @param notificationTypes A list of NotificationType enums to filter by.
     * @return A list of the top 5 (or fewer) matching Notification entities.
     */
    List<Notification> findTop5ByNotificationTypeInOrderByCreatedAtDesc(List<NotificationType> notificationTypes);
}
