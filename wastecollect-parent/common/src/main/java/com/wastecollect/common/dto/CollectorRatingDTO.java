// common/dto/CollectorRatingDTO.java
package com.wastecollect.common.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CollectorRatingDTO {
	@NotNull(message = "Collector ID is required")
	private Long collectorId;
	@NotNull(message = "Household ID is required")
	private Long householdId; // Assuming householdId is the ID of the user giving the rating
	@Min(value = 1, message = "Rating must be at least 1")
	@Max(value = 5, message = "Rating cannot be more than 5")
	private Integer ratingValue;
	@Size(max = 500, message = "Comment cannot exceed 500 characters")
	private String comment;
	private java.time.LocalDateTime ratingDate;
	private Long serviceRequestId; // Added field to link to the service request

	// Constructors
	public CollectorRatingDTO() {
	}

	public CollectorRatingDTO(Long collectorId, Long householdId, Integer ratingValue, String comment,
			java.time.LocalDateTime ratingDate) {
		this.collectorId = collectorId;
		this.householdId = householdId;
		this.ratingValue = ratingValue;
		this.comment = comment;
		this.ratingDate = ratingDate;
	}

    // New constructor including serviceRequestId
    public CollectorRatingDTO(Long collectorId, Long householdId, Integer ratingValue, String comment,
                              java.time.LocalDateTime ratingDate, Long serviceRequestId) {
        this.collectorId = collectorId;
        this.householdId = householdId;
        this.ratingValue = ratingValue;
        this.comment = comment;
        this.ratingDate = ratingDate;
        this.serviceRequestId = serviceRequestId;
    }

	// Getters and Setters
	public Long getCollectorId() {
		return collectorId;
	}

	public void setCollectorId(Long collectorId) {
		this.collectorId = collectorId;
	}

	public Long getHouseholdId() {
		return householdId;
	}

	public void setHouseholdId(Long householdId) {
		this.householdId = householdId;
	}

	public Integer getRatingValue() {
		return ratingValue;
	}

	public void setRatingValue(Integer ratingValue) {
		this.ratingValue = ratingValue;
	}

	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}

	public java.time.LocalDateTime getRatingDate() {
		return ratingDate;
	}

	public void setRatingDate(java.time.LocalDateTime ratingDate) {
		this.ratingDate = ratingDate;
	}

    public Long getServiceRequestId() {
        return serviceRequestId;
    }

    public void setServiceRequestId(Long serviceRequestId) {
        this.serviceRequestId = serviceRequestId;
    }
}
