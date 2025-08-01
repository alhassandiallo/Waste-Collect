// File: com/wastecollect/common/models/Notification.java
package com.wastecollect.common.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.wastecollect.common.utils.NotificationType;
import org.hibernate.annotations.CreationTimestamp; // For automatic timestamping

/**
 * Represents a notification sent to a user within the waste collection platform.
 * Notifications can be linked to specific entities like ServiceRequests, Payments, or Disputes.
 */
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The user who receives the notification
    @ManyToOne(fetch = FetchType.LAZY) // Lazy fetch to avoid N+1 problem unless explicitly needed
    @JoinColumn(name = "recipient_user_id", nullable = false)
    private User recipient;

    // The subject or title of the notification
    @Column(name = "subject", length = 255, nullable = false)
    private String subject;

    // The full content/body of the notification
    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;

    // Type of notification (e.g., ALERT, REMINDER, INFO)
    @Enumerated(EnumType.STRING) // Stores the enum's name (e.g., "PAYMENT_CONFIRMATION") in the database
    @Column(name = "notification_type", length = 50, nullable = false)
    private NotificationType notificationType;

    // Timestamp when the notification was created (automatically set by Hibernate)
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Timestamp when the notification was read by the recipient
    @Column(name = "read_at")
    private LocalDateTime readAt;

    // Whether the notification has been read (default to false)
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    // Optional: Link to a specific ServiceRequest if the notification is context-specific
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_request_id")
    private ServiceRequest serviceRequest;

    // Optional: Link to a specific Payment if the notification is context-specific
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    private Payment payment;

    // Optional: Link to a specific Dispute if the notification is context-specific
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dispute_id")
    private Dispute dispute;

    public Notification() {
		super();
	}

	/**
     * Parameterized constructor for creating new notifications.
     * Timestamps and isRead status are handled automatically or default.
     *
     * @param recipient The user who will receive this notification.
     * @param subject The subject/title of the notification.
     * @param message The full message content.
     * @param notificationType The type of notification (e.g., ALERT, REMINDER).
     * @param serviceRequest Optional: The service request related to this notification.
     * @param payment Optional: The payment related to this notification.
     * @param dispute Optional: The dispute related to this notification.
     */
    public Notification(User recipient, String subject, String message, NotificationType notificationType,
                        ServiceRequest serviceRequest, Payment payment, Dispute dispute) {
        this.recipient = recipient;
        this.subject = subject;
        this.message = message;
        this.notificationType = notificationType;
        this.serviceRequest = serviceRequest;
        this.payment = payment;
        this.dispute = dispute;
        // createdAt is set by @CreationTimestamp
        // isRead defaults to false
    }

    /**
     * Marks the notification as read and sets the read timestamp.
     */
    public void markAsRead() {
        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }

    // --- START OF MODIFICATION ---
    /**
     * Marks the notification as unread and clears the read timestamp.
     */
    public void markAsUnread() {
        this.isRead = false;
        this.readAt = null;
    }
    // --- END OF MODIFICATION ---

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public User getRecipient() {
		return recipient;
	}

	public void setRecipient(User recipient) {
		this.recipient = recipient;
	}

	public String getSubject() {
		return subject;
	}

	public void setSubject(String subject) {
		this.subject = subject;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public NotificationType getNotificationType() {
		return notificationType;
	}

	public void setNotificationType(NotificationType notificationType) {
		this.notificationType = notificationType;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getReadAt() {
		return readAt;
	}

	public void setReadAt(LocalDateTime readAt) {
		this.readAt = readAt;
	}

	public Boolean getIsRead() {
		return isRead;
	}

	public void setIsRead(Boolean isRead) {
		this.isRead = isRead;
	}

	public ServiceRequest getServiceRequest() {
		return serviceRequest;
	}

	public void setServiceRequest(ServiceRequest serviceRequest) {
		this.serviceRequest = serviceRequest;
	}

	public Payment getPayment() {
		return payment;
	}

	public void setPayment(Payment payment) {
		this.payment = payment;
	}

	public Dispute getDispute() {
		return dispute;
	}

	public void setDispute(Dispute dispute) {
		this.dispute = dispute;
	}


}
