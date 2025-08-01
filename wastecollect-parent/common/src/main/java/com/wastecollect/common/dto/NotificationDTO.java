// File: com/wastecollect/common/dto/NotificationDTO.java
package com.wastecollect.common.dto;

import com.wastecollect.common.utils.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for Notification entities.
 * Used for sending notification data to the client and receiving notification data from the client.
 */
//@Data // Lombok: Generates getters, setters, equals, hashCode, and toString
//@NoArgsConstructor // Lombok: Generates a no-argument constructor
//@AllArgsConstructor // Lombok: Generates a constructor with all fields
public class NotificationDTO {
    private Long id;

    @NotNull(message = "Recipient user ID cannot be null")
    private Long recipientId; // ID of the user receiving the notification

    @NotBlank(message = "Subject cannot be empty")
    @Size(max = 255, message = "Subject must be less than 255 characters")
    private String subject;

    @NotBlank(message = "Message cannot be empty")
    private String message;

    @NotNull(message = "Notification type cannot be null")
    private NotificationType notificationType;

    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private Boolean isRead;

    // Optional IDs for linked entities
    private Long serviceRequestId;
    private Long paymentId;
    private Long disputeId;
	
    
    
    public NotificationDTO(Long id, @NotNull(message = "Recipient user ID cannot be null") Long recipientId,
			@NotBlank(message = "Subject cannot be empty") @Size(max = 255, message = "Subject must be less than 255 characters") String subject,
			@NotBlank(message = "Message cannot be empty") String message,
			@NotNull(message = "Notification type cannot be null") NotificationType notificationType,
			LocalDateTime createdAt, LocalDateTime readAt, Boolean isRead, Long serviceRequestId, Long paymentId,
			Long disputeId) {
		super();
		this.id = id;
		this.recipientId = recipientId;
		this.subject = subject;
		this.message = message;
		this.notificationType = notificationType;
		this.createdAt = createdAt;
		this.readAt = readAt;
		this.isRead = isRead;
		this.serviceRequestId = serviceRequestId;
		this.paymentId = paymentId;
		this.disputeId = disputeId;
	}
	public NotificationDTO() {
		
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public Long getRecipientId() {
		return recipientId;
	}
	public void setRecipientId(Long recipientId) {
		this.recipientId = recipientId;
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
	public Long getServiceRequestId() {
		return serviceRequestId;
	}
	public void setServiceRequestId(Long serviceRequestId) {
		this.serviceRequestId = serviceRequestId;
	}
	public Long getPaymentId() {
		return paymentId;
	}
	public void setPaymentId(Long paymentId) {
		this.paymentId = paymentId;
	}
	public Long getDisputeId() {
		return disputeId;
	}
	public void setDisputeId(Long disputeId) {
		this.disputeId = disputeId;
	}
    
}
