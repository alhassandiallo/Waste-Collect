package com.wastecollect.backend.controller;

import com.wastecollect.backend.service.NotificationService;
import com.wastecollect.common.dto.NotificationDTO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.wastecollect.common.utils.NotificationType;
import org.springframework.http.HttpMethod;

import java.util.Optional;

/**
 * REST Controller for managing notifications.
 * Provides endpoints for creating, retrieving, updating, and deleting notifications.
 */
@RestController
@RequestMapping("/api/v1/notifications")
//@CrossOrigin(origins = "http://localhost:3000", methods = {"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"}, allowedHeaders = "*", allowCredentials = "true")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    /**
     * Creates a new notification.
     * This endpoint might be used by other internal services or admin.
     * @param notificationDTO The DTO containing notification details.
     * @return ResponseEntity with the created NotificationDTO.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MUNICIPAL_MANAGER') or hasRole('COLLECTOR') or hasRole('HOUSEHOLD')") // Example: Allow certain roles to create notifications
    public ResponseEntity<NotificationDTO> createNotification(@Valid @RequestBody NotificationDTO notificationDTO) {
        NotificationDTO createdNotification = notificationService.createNotification(notificationDTO);
        return new ResponseEntity<>(createdNotification, HttpStatus.CREATED);
    }

    /**
     * Retrieves a notification by its ID.
     * @param id The ID of the notification.
     * @return ResponseEntity with the NotificationDTO.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MUNICIPAL_MANAGER', 'COLLECTOR', 'HOUSEHOLD')")
    public ResponseEntity<NotificationDTO> getNotificationById(@PathVariable Long id) {
        NotificationDTO notification = notificationService.getNotificationById(id);
        return ResponseEntity.ok(notification);
    }

    /**
     * Retrieves notifications for a specific user with pagination and filters.
     * Accessible by ADMIN and the recipient user themselves.
     *
     * @param userId The ID of the recipient user.
     * @param isRead Optional filter for read status (true for read, false for unread).
     * @param notificationType Optional filter for notification type (e.g., ALERT, REMINDER).
     * @param pageable Pagination and sorting information.
     * @return A paginated list of NotificationDTOs.
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or (hasAnyRole('COLLECTOR', 'HOUSEHOLD', 'MUNICIPALITY', 'MUNICIPAL_MANAGER') and #userId == authentication.principal.id)")
    public ResponseEntity<Page<NotificationDTO>> getNotificationsForUser(
            @PathVariable Long userId,
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(required = false) NotificationType notificationType,
            @PageableDefault(page = 0, size = 10, sort = "createdAt,desc") Pageable pageable) {
        
        Page<NotificationDTO> notifications = notificationService.getNotificationsForUser(userId, isRead, notificationType, pageable);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Marks a specific notification as read.
     * @param id The ID of the notification to mark as read.
     * @return ResponseEntity with the updated NotificationDTO.
     */
    @PutMapping("/{id}/mark-read")
    @PreAuthorize("hasAnyRole('ADMIN', 'MUNICIPAL_MANAGER', 'COLLECTOR', 'HOUSEHOLD')")
    public ResponseEntity<NotificationDTO> markNotificationAsRead(@PathVariable Long id) {
        NotificationDTO updatedNotification = notificationService.markNotificationAsRead(id);
        return ResponseEntity.ok(updatedNotification);
    }

    /**
     * Marks a specific notification as unread.
     * @param id The ID of the notification to mark as unread.
     * @return ResponseEntity with the updated NotificationDTO.
     */
    @PutMapping("/{id}/mark-unread")
    @PreAuthorize("hasAnyRole('ADMIN', 'MUNICIPAL_MANAGER', 'COLLECTOR', 'HOUSEHOLD')")
    public ResponseEntity<NotificationDTO> markNotificationAsUnread(@PathVariable Long id) {
        NotificationDTO updatedNotification = notificationService.markNotificationAsUnread(id);
        return ResponseEntity.ok(updatedNotification);
    }

    /**
     * Marks all unread notifications for a specific user as read.
     * @param userId The ID of the user.
     * @return ResponseEntity with the count of notifications marked as read.
     */
    @PutMapping("/user/{userId}/mark-all-read")
    @PreAuthorize("hasRole('ADMIN') or (hasAnyRole('COLLECTOR', 'HOUSEHOLD', 'MUNICIPALITY', 'MUNICIPAL_MANAGER') and #userId == authentication.principal.id)")
    public ResponseEntity<Long> markAllNotificationsAsReadForUser(@PathVariable Long userId) {
        long count = notificationService.markAllNotificationsAsReadForUser(userId);
        return ResponseEntity.ok(count);
    }

    /**
     * Deletes a notification by its ID.
     * @param id The ID of the notification to delete.
     * @return ResponseEntity indicating success.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MUNICIPAL_MANAGER')") // Typically only admin or manager can delete
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Retrieves the current security alert status.
     * @return ResponseEntity with the latest unread ALERT notification, or 204 No Content if none.
     */
    @GetMapping("/alert-status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MUNICIPAL_MANAGER', 'COLLECTOR', 'HOUSEHOLD')")
    public ResponseEntity<NotificationDTO> getAlertStatus() {
        NotificationDTO alert = notificationService.getAlertStatus();
        if (alert != null) {
            return ResponseEntity.ok(alert);
        } else {
            return ResponseEntity.noContent().build();
        }
    }
}
