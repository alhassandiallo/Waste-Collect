package com.wastecollect.common.dto;

// This DTO is for sending Admin data to the frontend, without the password
public class AdminResponseDTO extends UserDTO { // Extend UserDTO for common fields
	private String position;
	private String managementArea;

	public AdminResponseDTO() {
	}

	public AdminResponseDTO(Long id, String firstName, String lastName, String email, String phoneNumber,
			String address, String position, String managementArea) {
		super(id, firstName, lastName, email, phoneNumber, address, com.wastecollect.common.utils.RoleName.ADMIN); // Pass
																													// RoleName
		this.position = position;
		this.managementArea = managementArea;
	}

	public String getPosition() {
		return position;
	}

	public void setPosition(String position) {
		this.position = position;
	}

	public String getManagementArea() {
		return managementArea;
	}

	public void setManagementArea(String managementArea) {
		this.managementArea = managementArea;
	}
}