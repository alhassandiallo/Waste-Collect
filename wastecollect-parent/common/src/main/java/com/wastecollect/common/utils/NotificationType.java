// File: com/wastecollect/common/utils/NotificationType.java
package com.wastecollect.common.utils;

/**
 * Enumeration for different types of notifications in the system.
 * Provides clear, type-safe categories for notifications.
 */
public enum NotificationType {
    ALERT,                  // General alerts
    REMINDER,               // Reminders for actions (e.g., payment due, collection schedule)
    INFO,                   // Informational messages
    SYSTEM_MESSAGE,         // Messages from the system itself (e.g., account updates)
    PAYMENT_CONFIRMATION,   // Confirmation of a successful payment
    DISPUTE_RESOLUTION,     // Update on a dispute's status
    SERVICE_REQUEST_UPDATE, // Update on a service request's status
    NEW_SERVICE_REQUEST,    // Notification to collectors about a new service request
    COLLECTION_REMINDER     // Reminder for households about upcoming collection
}
