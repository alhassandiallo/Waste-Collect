// common/dto/CollectorUpdateDTO.java
package com.wastecollect.common.dto;

import com.wastecollect.common.utils.CollectorStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CollectorUpdateDTO {
	@NotBlank(message = "First name is required")
	private String firstName;
	@NotBlank(message = "Last name is required")
	private String lastName;
	@NotBlank(message = "Email is required")
	@Email(message = "Invalid email format")
	private String email;

    // Removed password field from this DTO for separate password update endpoint

	private String phoneNumber;
	private String address;

	@NotNull(message = "Status is required")
	private CollectorStatus status;

	// Constructors
	public CollectorUpdateDTO() {
	}

    // Updated constructor without password
	public CollectorUpdateDTO(String firstName, String lastName, String email,
	                          String phoneNumber, String address, CollectorStatus status) {
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.phoneNumber = phoneNumber;
		this.address = address;
		this.status = status;
	}

	// Getters and Setters
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

    // Removed password getter and setter

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

	public CollectorStatus getStatus() {
		return status;
	}

	public void setStatus(CollectorStatus status) {
		this.status = status;
	}
}
