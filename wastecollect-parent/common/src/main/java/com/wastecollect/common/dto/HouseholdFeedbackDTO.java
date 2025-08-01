package com.wastecollect.common.dto;

import java.time.LocalDateTime; // Ensure this import is present

public class HouseholdFeedbackDTO {
    private Long id;
    private String householdName;
    private Integer rating;
    private String comment;
    private String serviceType; // e.g., "General", "Waste Collection"
    private LocalDateTime createdAt; // This should be LocalDateTime

    public HouseholdFeedbackDTO() {}

    public HouseholdFeedbackDTO(Long id, String householdName, Integer rating, String comment, String serviceType, LocalDateTime createdAt) {
        this.id = id;
        this.householdName = householdName;
        this.rating = rating;
        this.comment = comment;
        this.serviceType = serviceType;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getHouseholdName() {
        return householdName;
    }

    public void setHouseholdName(String householdName) {
        this.householdName = householdName;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
