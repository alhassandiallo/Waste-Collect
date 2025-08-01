// common/dto/ServiceRequestCreationDTO.java
package com.wastecollect.common.dto;

import com.wastecollect.common.utils.WasteType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class ServiceRequestCreationDTO {

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Waste type is required")
    private WasteType wasteType;

    private Double estimatedVolume; // Optional, can be null

    @NotNull(message = "Preferred date and time is required")
    private LocalDateTime preferredDate;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "Address is required")
    private String address;

    private String comment; // Optional

    @NotNull(message = "Household ID is required")
    private Long householdId;

    // Constructors
    public ServiceRequestCreationDTO() {
    }

    public ServiceRequestCreationDTO(String description, WasteType wasteType, Double estimatedVolume,
                                     LocalDateTime preferredDate, String phone, String address, String comment,
                                     Long householdId) {
        this.description = description;
        this.wasteType = wasteType;
        this.estimatedVolume = estimatedVolume;
        this.preferredDate = preferredDate;
        this.phone = phone;
        this.address = address;
        this.comment = comment;
        this.householdId = householdId;
    }

    // Getters and Setters
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public WasteType getWasteType() {
        return wasteType;
    }

    public void setWasteType(WasteType wasteType) {
        this.wasteType = wasteType;
    }

    public Double getEstimatedVolume() {
        return estimatedVolume;
    }

    public void setEstimatedVolume(Double estimatedVolume) {
        this.estimatedVolume = estimatedVolume;
    }

    public LocalDateTime getPreferredDate() {
        return preferredDate;
    }

    public void setPreferredDate(LocalDateTime preferredDate) {
        this.preferredDate = preferredDate;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Long getHouseholdId() {
        return householdId;
    }

    public void setHouseholdId(Long householdId) {
        this.householdId = householdId;
    }
}