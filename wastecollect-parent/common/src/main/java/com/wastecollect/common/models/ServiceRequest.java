package com.wastecollect.common.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.wastecollect.common.utils.ServiceRequestStatus;
import com.wastecollect.common.utils.WasteType;

@Entity
@Table(name = "service_requests")
public class ServiceRequest {

	// Unique identifier for the service request (primary key)
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// Description of the service request
	@Column(name = "description", length = 500)
	private String description;

	// Type of waste (household, electronic, etc.)
	@Enumerated(EnumType.STRING)
	@Column(name = "waste_type", length = 50)
	private WasteType wasteType;

	// Estimated volume of waste (in liters or kg)
	@Column(name = "estimated_volume")
	private Double estimatedVolume;

	@Column(name = "preferred-date")
	private LocalDateTime preferredDate;

	// Status of the service request (pending, in progress, completed)
	@Enumerated(EnumType.STRING)
	@Column(name = "status", length = 20)
	private ServiceRequestStatus status;

	// Date and time the request was created
	@Column(name = "created_at")
	private LocalDateTime createdAt;

	// Date and time the request was updated
	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	@Column(name = "address")
	private String address;

	@Column(name = "phone_number")
	private String phoneNumber;

	// Many-to-one relationship with Household (the household that created the
	// request)
	@ManyToOne
	@JoinColumn(name = "household_id")
	private Household household;

	// Many-to-one relationship with Collector (the assigned collector for the
	// request)
	@ManyToOne
	@JoinColumn(name = "collector_id")
	private Collector collector;

	// Many-to-one relationship with Municipality (the municipality related to the
	// request)
	@ManyToOne
	@JoinColumn(name = "municipality_id")
	private Municipality municipality;

	@Column(name = "comment")
	private String comment;

	// No-argument constructor (required by JPA)
	public ServiceRequest() {
	}

	// Parameterized constructor
	public ServiceRequest(String description, WasteType wasteType, Double estimatedVolume, ServiceRequestStatus status,
			Household household) {
		this.description = description;
		this.wasteType = wasteType;
		this.estimatedVolume = estimatedVolume;
		this.status = status;
		this.household = household;
		this.createdAt = LocalDateTime.now();
		this.updatedAt = LocalDateTime.now();
	}

	// Getters and setters
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

	public LocalDateTime getPreferredDate() {
		return preferredDate;
	}

	public void setPreferredDate(LocalDateTime preferredDate) {
		this.preferredDate = preferredDate;
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

	public String getPhoneNumber() {
		return phoneNumber;
	}

	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}

	public Household getHousehold() {
		return household;
	}

	public void setHousehold(Household household) {
		this.household = household;
	}

	public Collector getCollector() {
		return collector;
	}

	public void setCollector(Collector collector) {
		this.collector = collector;
	}

	public Municipality getMunicipality() {
		return municipality;
	}

	public void setMunicipality(Municipality municipality) {
		this.municipality = municipality;
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

	// Method to update service request status
	public void updateServiceRequestStatus(ServiceRequestStatus newStatus) {
		this.status = newStatus;
		this.updatedAt = LocalDateTime.now();
	}
}