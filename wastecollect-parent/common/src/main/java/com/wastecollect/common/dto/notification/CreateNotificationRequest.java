package com.wastecollect.common.dto.notification;

import com.wastecollect.common.utils.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public class CreateNotificationRequest {

 @NotBlank(message = "Subject cannot be empty")
 @Size(max = 255, message = "Subject must be less than 255 characters")
 private String subject;

 @NotBlank(message = "Message cannot be empty")
 private String message;

 @NotNull(message = "Notification type cannot be null")
 private NotificationType notificationType;

 // Targeting options
 private String targetAudience; // e.g., "ALL", "ROLE", "SPECIFIC_USERS"
 private String targetRole; // e.g., "COLLECTOR", "HOUSEHOLD", "MUNICIPALITY", "MUNICIPAL_MANAGER"
 private List<Long> targetUserIds; // Specific user IDs

 // Optional: Linked entity IDs if the notification is about a specific service request, payment, or dispute
 private Long serviceRequestId;
 private Long paymentId;
 private Long disputeId;

 // Constructors, getters, setters
 public CreateNotificationRequest() {}

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

 public String getTargetAudience() {
     return targetAudience;
 }

 public void setTargetAudience(String targetAudience) {
     this.targetAudience = targetAudience;
 }

 public String getTargetRole() {
     return targetRole;
 }

 public void setTargetRole(String targetRole) {
     this.targetRole = targetRole;
 }

 public List<Long> getTargetUserIds() {
     return targetUserIds;
 }

 public void setTargetUserIds(List<Long> targetUserIds) {
     this.targetUserIds = targetUserIds;
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

