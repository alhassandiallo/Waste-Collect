// common/dto/CollectorProfileDTO.java (renamed/new file)
package com.wastecollect.common.dto;

import com.wastecollect.common.utils.CollectorStatus;

public class CollectorProfileDTO { // Renamed from CollectorDTO or new class
	private Long id;
	private String firstName;
	private String lastName;
	private String email;
	private String phoneNumber;
	private String address;
	private String collectorId;
	private CollectorStatus status;
	private String municipalityName; // NEW: Added municipality name for display
	// Exclude password field

	// Constructors
	public CollectorProfileDTO() {
	}

	public CollectorProfileDTO(Long id, String firstName, String lastName, String email, String phoneNumber,
			String address, String collectorId, CollectorStatus status, String municipalityName) { // Updated constructor
		this.id = id;
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.phoneNumber = phoneNumber;
		this.address = address;
		this.collectorId = collectorId;
		this.status = status;
		this.municipalityName = municipalityName; // Set municipality name
	}

	// Getters and Setters for all fields (excluding password)
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPhoneNumber() {
		return phoneNumber;
	}

	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getCollectorId() {
		return collectorId;
	}

	public void setCollectorId(String collectorId) {
		this.collectorId = collectorId;
	}

	public CollectorStatus getStatus() {
		return status;
	}

	public void setStatus(CollectorStatus status) {
		this.status = status;
	}

	public String getMunicipalityName() { // NEW Getter
		return municipalityName;
	}

	public void setMunicipalityName(String municipalityName) { // NEW Setter
		this.municipalityName = municipalityName;
	}
}
