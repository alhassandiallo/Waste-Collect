package com.wastecollect.common.dto;

import com.wastecollect.common.utils.HousingType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class HouseholdCreationDTO {

	@NotBlank(message = "First name is required")
	@Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
	private String firstName;

	@NotBlank(message = "Last name is required")
	@Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
	private String lastName;

	@NotBlank(message = "Email is required")
	@Email(message = "Invalid email format")
	private String email;

	@NotBlank(message = "Password is required")
	@Size(min = 8, message = "Password must be at least 8 characters long")
	private String password;

	@NotBlank(message = "Phone number is required")
	private String phoneNumber;

	@NotBlank(message = "Address is required")
	private String address;

	@NotNull(message = "Number of members is required")
	private Integer numberOfMembers;

	@NotNull(message = "Housing type is required")
	private HousingType housingType;

	// Removed @NotBlank(message = "Area is required") private String area;
	// Relying solely on municipalityName

	@NotBlank(message = "Municipality name is required")
    private String municipalityName;

    // Added collectionPreferences field
    private String collectionPreferences;

	// Optional: Add latitude and longitude if collected during creation
	private Double latitude;
	private Double longitude;

	// Constructors
	public HouseholdCreationDTO() {
	}

    // Updated constructor to remove 'area' and include collectionPreferences
	public HouseholdCreationDTO(String firstName, String lastName, String email, String password, String phoneNumber,
			String address, Integer numberOfMembers, HousingType housingType,
            String collectionPreferences, // Added
            Double latitude, Double longitude,  String municipalityName) {
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.password = password;
		this.phoneNumber = phoneNumber;
		this.address = address;
		this.numberOfMembers = numberOfMembers;
		this.housingType = housingType;
		// this.area = area; // Removed
		this.municipalityName = municipalityName;
        this.collectionPreferences = collectionPreferences; // Added
		this.latitude = latitude;
		this.longitude = longitude;
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

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
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

	public Integer getNumberOfMembers() {
		return numberOfMembers;
	}

	public void setNumberOfMembers(Integer numberOfMembers) {
		this.numberOfMembers = numberOfMembers;
	}

	public HousingType getHousingType() {
		return housingType;
	}

	public void setHousingType(HousingType housingType) {
		this.housingType = housingType;
	}

	// Removed getArea() and setArea() methods as 'area' field is removed.
	// public String getArea() {
	// 	return area;
	// }
	// public void setArea(String area) {
	// 	this.area = area;
	// }

    public String getMunicipalityName() {
		return municipalityName;
	}

	public void setMunicipalityName(String municipalityName) {
		this.municipalityName = municipalityName;
	}

	// New getter and setter for collectionPreferences
    public String getCollectionPreferences() {
        return collectionPreferences;
    }

    public void setCollectionPreferences(String collectionPreferences) {
        this.collectionPreferences = collectionPreferences;
    }

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
}
