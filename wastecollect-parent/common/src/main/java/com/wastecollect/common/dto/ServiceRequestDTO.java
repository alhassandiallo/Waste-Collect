package com.wastecollect.common.dto;

import com.wastecollect.common.utils.ServiceRequestStatus;
import com.wastecollect.common.utils.WasteType;
import java.time.LocalDateTime;

public class ServiceRequestDTO {
    private Long id;
    private String description;
    private WasteType wasteType;
    private Double estimatedVolume;
    private String phone;
    private String comment;
    private String address;
    private LocalDateTime preferredDate;
    private ServiceRequestStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String householdAddress; // Field to store the household's address
    private HouseholdDTO household;  // Field to store basic household info

    // Constructor, getters, and setters
    public ServiceRequestDTO() {
    }

    // Existing constructor with 7 arguments
    public ServiceRequestDTO(Long id, String description, WasteType wasteType, Double estimatedVolume,
            ServiceRequestStatus status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.description = description;
        this.wasteType = wasteType;
        this.estimatedVolume = estimatedVolume;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // NEW: Constructor matching the 9 arguments from getRealTimeServiceRequests()
    public ServiceRequestDTO(Long id, String description, WasteType wasteType, Double estimatedVolume,
                             ServiceRequestStatus status, LocalDateTime createdAt, LocalDateTime updatedAt,
                             String householdAddress, HouseholdDTO household) {
        this.id = id;
        this.description = description;
        this.wasteType = wasteType;
        this.estimatedVolume = estimatedVolume;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.householdAddress = householdAddress;
        this.household = household;
    }

    public ServiceRequestDTO(Long id2, WasteType wasteType2, Double estimatedVolume2, LocalDateTime preferredDate,
			String address, String phoneNumber, ServiceRequestStatus status2) {
		this.id = id2;
		this.wasteType = wasteType2;
		this.estimatedVolume = estimatedVolume2;
		this.preferredDate = preferredDate;
		this.householdAddress = address;
		this.phone = phoneNumber;
		this.status = status2;
	}

	// Getters and setters (already present)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public ServiceRequestStatus getStatus() {
        return status;
    }

    public void setStatus(ServiceRequestStatus status) {
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

    // NEW Getters and Setters for the added fields
    public String getHouseholdAddress() {
        return householdAddress;
    }

    public void setHouseholdAddress(String householdAddress) {
        this.householdAddress = householdAddress;
    }

    public HouseholdDTO getHousehold() {
        return household;
    }

    public void setHousehold(HouseholdDTO household) {
        this.household = household;
    }

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public LocalDateTime getPreferredDate() {
		return preferredDate;
	}

	public void setPreferredDate(LocalDateTime preferredDate) {
		this.preferredDate = preferredDate;
	}
	
	 public String getComment() {
			return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}
}