package com.wastecollect.common.dto;

import com.wastecollect.common.utils.ServiceRequestStatus;
import com.wastecollect.common.utils.WasteType;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

// WasteCollectionDataDTO.java
// Represents aggregated waste collection data for a municipality
public class WasteCollectionDataDTO {
	private Long totalCollections;
	private Double totalWasteVolumeKg;
	private Double averageWastePerCollectionKg;
	private Long pendingServiceRequests;
	private Long completedServiceRequests;
	private Map<WasteType, Double> wasteVolumeByType; // Sum of waste volume per type

	public WasteCollectionDataDTO() {
	}

	public WasteCollectionDataDTO(Long totalCollections, Double totalWasteVolumeKg, Double averageWastePerCollectionKg,
			Long pendingServiceRequests, Long completedServiceRequests, Map<WasteType, Double> wasteVolumeByType) {
		this.totalCollections = totalCollections;
		this.totalWasteVolumeKg = totalWasteVolumeKg;
		this.averageWastePerCollectionKg = averageWastePerCollectionKg;
		this.pendingServiceRequests = pendingServiceRequests;
		this.completedServiceRequests = completedServiceRequests;
		this.wasteVolumeByType = wasteVolumeByType;
	}

	// Getters and Setters
	public Long getTotalCollections() {
		return totalCollections;
	}

	public void setTotalCollections(Long totalCollections) {
		this.totalCollections = totalCollections;
	}

	public Double getTotalWasteVolumeKg() {
		return totalWasteVolumeKg;
	}

	public void setTotalWasteVolumeKg(Double totalWasteVolumeKg) {
		this.totalWasteVolumeKg = totalWasteVolumeKg;
	}

	public Double getAverageWastePerCollectionKg() {
		return averageWastePerCollectionKg;
	}

	public void setAverageWastePerCollectionKg(Double averageWastePerCollectionKg) {
		this.averageWastePerCollectionKg = averageWastePerCollectionKg;
	}

	public Long getPendingServiceRequests() {
		return pendingServiceRequests;
	}

	public void setPendingServiceRequests(Long pendingServiceRequests) {
		this.pendingServiceRequests = pendingServiceRequests;
	}

	public Long getCompletedServiceRequests() {
		return completedServiceRequests;
	}

	public void setCompletedServiceRequests(Long completedServiceRequests) {
		this.completedServiceRequests = completedServiceRequests;
	}

	public Map<WasteType, Double> getWasteVolumeByType() {
		return wasteVolumeByType;
	}

	public void setWasteVolumeByType(Map<WasteType, Double> wasteVolumeByType) {
		this.wasteVolumeByType = wasteVolumeByType;
	}
}