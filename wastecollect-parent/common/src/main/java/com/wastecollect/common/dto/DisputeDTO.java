// common/dto/DisputeDTO.java
package com.wastecollect.common.dto;

import com.wastecollect.common.utils.DisputeStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class DisputeDTO {
    private Long id;
    @NotBlank(message = "Title cannot be empty")
    private String title; // Moved up for consistency
    @NotBlank(message = "Description cannot be empty")
    private String description;
    @NotNull(message = "Dispute status cannot be null")
    private DisputeStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean read; // Added read status

    // Added fields for relationships
    private Long userId;
    private Long serviceRequestId;
    private Long paymentId;

    // Constructor, getters, and setters
    public DisputeDTO() {
    }

    // Consolidated constructor for creating/updating disputes
    public DisputeDTO(Long id, String title, String description, DisputeStatus status, LocalDateTime createdAt,
                      LocalDateTime updatedAt, boolean read, Long userId, Long serviceRequestId, Long paymentId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.read = read;
        this.userId = userId;
        this.serviceRequestId = serviceRequestId;
        this.paymentId = paymentId;
    }

    // Constructor for when creating a new dispute from client (ID, createdAt, updatedAt, read are often set by backend)
    public DisputeDTO(String title, String description, Long userId, Long serviceRequestId, Long paymentId) {
        this.title = title;
        this.description = description;
        this.userId = userId;
        this.serviceRequestId = serviceRequestId;
        this.paymentId = paymentId;
        this.status = DisputeStatus.OPEN; // Default status
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.read = false; // Default read status
    }


    public DisputeDTO(Long id, String description, DisputeStatus status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.description = description;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        // Default values for other fields not passed in this constructor
        this.title = null; // Or some default like ""
        this.read = false;
        this.userId = null;
        this.serviceRequestId = null;
        this.paymentId = null;
    }

	// Getters and setters (ensure all fields have them)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public DisputeStatus getStatus() {
        return status;
    }

    public void setStatus(DisputeStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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
}