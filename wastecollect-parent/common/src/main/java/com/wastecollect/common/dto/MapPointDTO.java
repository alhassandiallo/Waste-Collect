package com.wastecollect.common.dto;

//MapPointDTO.java
//Represents a geographical point with associated metadata for mapping
public class MapPointDTO {
	private Double latitude;
	private Double longitude;
	private String type; // e.g., "collection", "service_request", "underserved_area"
	private String description;
	private String status; // For service requests or collections
	private Long id; // ID of the entity represented

	public MapPointDTO() {
	}

	public MapPointDTO(Double latitude, Double longitude, String type, String description, String status, Long id) {
		this.latitude = latitude;
		this.longitude = longitude;
		this.type = type;
		this.description = description;
		this.status = status;
		this.id = id;
	}

	// Getters and Setters
	public Double getLatitude() {
		return latitude;
	}

	public void setLatitude(Double latitude) {
		this.latitude = latitude;
	}

	public Double getLongitude() {
		return longitude;
	}

	public void setLongitude(Double longitude) {
		this.longitude = longitude;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}
}
