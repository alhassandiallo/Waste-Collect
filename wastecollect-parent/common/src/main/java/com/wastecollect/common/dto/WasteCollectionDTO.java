package com.wastecollect.common.dto;

import java.time.LocalDateTime;

public class WasteCollectionDTO {
	private Long id;
	private LocalDateTime collectionDate;
	private Double actualWeight;
	private String locationCoordinates;
	private Integer collectorRating;
	private String collectorComment;

	// Fields for Upcoming Pickups view
	private Long serviceRequestId;
	private String status; // Changed to String for DTO
	private Long collectorId;
	private String collectorFirstName;
	private String collectorLastName;

	// Default constructor
	public WasteCollectionDTO() {
	}

	// Existing constructor for detailed collection view
	public WasteCollectionDTO(Long id, LocalDateTime collectionDate, Double actualWeight, String locationCoordinates,
			Integer collectorRating, String collectorComment) {
		this.id = id;
		this.collectionDate = collectionDate;
		this.actualWeight = actualWeight;
		this.locationCoordinates = locationCoordinates;
		this.collectorRating = collectorRating;
		this.collectorComment = collectorComment;
	}

	// NEW Constructor for Upcoming Pickups
	public WasteCollectionDTO(Long id, Long serviceRequestId, LocalDateTime collectionDate, Double actualWeight,
			String status, Long collectorId, String collectorFirstName, String collectorLastName) {
		this.id = id;
		this.serviceRequestId = serviceRequestId;
		this.collectionDate = collectionDate;
		this.actualWeight = actualWeight;
		this.status = status;
		this.collectorId = collectorId;
		this.collectorFirstName = collectorFirstName;
		this.collectorLastName = collectorLastName;
	}

	// Getters and setters (ensure all fields have them)
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public LocalDateTime getCollectionDate() {
		return collectionDate;
	}

	public void setCollectionDate(LocalDateTime collectionDate) {
		this.collectionDate = collectionDate;
	}

	public Double getActualWeight() {
		return actualWeight;
	}

	public void setActualWeight(Double actualWeight) {
		this.actualWeight = actualWeight;
	}

	public String getLocationCoordinates() {
		return locationCoordinates;
	}

	public void setLocationCoordinates(String locationCoordinates) {
		this.locationCoordinates = locationCoordinates;
	}

	public Integer getCollectorRating() {
		return collectorRating;
	}

	public void setCollectorRating(Integer collectorRating) {
		this.collectorRating = collectorRating;
	}

	public String getCollectorComment() {
		return collectorComment;
	}

	public void setCollectorComment(String collectorComment) {
		this.collectorComment = collectorComment;
	}

	// Getters and Setters for the new fields
	public Long getServiceRequestId() {
		return serviceRequestId;
	}

	public void setServiceRequestId(Long serviceRequestId) {
		this.serviceRequestId = serviceRequestId;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Long getCollectorId() {
		return collectorId;
	}

	public void setCollectorId(Long collectorId) {
		this.collectorId = collectorId;
	}

	public String getCollectorFirstName() {
		return collectorFirstName;
	}

	public void setCollectorFirstName(String collectorFirstName) {
		this.collectorFirstName = collectorFirstName;
	}

	public String getCollectorLastName() {
		return collectorLastName;
	}

	public void setCollectorLastName(String collectorLastName) {
		this.collectorLastName = collectorLastName;
	}
}