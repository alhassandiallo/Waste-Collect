package com.wastecollect.common.dto;

import com.wastecollect.common.utils.HousingType;
import jakarta.validation.constraints.Email; // Added for email validation
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotBlank; // Added for email validation if it's mandatory

public class HouseholdUpdateDTO {

	@Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
	private String firstName;

	@Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
	private String lastName;

	// Email field added back and validated
	@NotBlank(message = "Email is required") // Consider if email should be mandatory for update
	@Email(message = "Invalid email format")
	private String email;

    // Password field added for updates. It's often optional for updates.
    //@Size(min = 8, message = "Password must be at least 8 characters long") // Optional: add validation
   // private String password;

	private String phoneNumber;
	private String address;
	private Integer numberOfMembers;
	private HousingType housingType;
	private String area;
	private String collectionPreferences;
	private Double latitude;
	private Double longitude;
	private Long municipalityId; 
    private Boolean isActive; // Added to match AdminService usage

	// Constructors, Getters, and Setters
	public HouseholdUpdateDTO() {
	}

    public HouseholdUpdateDTO(String firstName, String lastName, String email, String phoneNumber, String address,
            Integer numberOfMembers, HousingType housingType, String area, String collectionPreferences,
            Double latitude, Double longitude, Long municipalityId, Boolean isActive) { // Updated constructor
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.numberOfMembers = numberOfMembers;
        this.housingType = housingType;
        this.area = area;
        this.collectionPreferences = collectionPreferences;
        this.latitude = latitude;
        this.longitude = longitude;
        this.municipalityId = municipalityId;
        this.isActive = isActive; // Initialize isActive
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

	public String getArea() {
		return area;
	}

	public void setArea(String area) {
		this.area = area;
	}

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

	public Long getMunicipalityId() {
		return municipalityId;
	}

	public void setMunicipalityId(Long municipalityId) {
		this.municipalityId = municipalityId;
	}

    public Boolean getIsActive() { // Getter for isActive
        return isActive;
    }

    public void setIsActive(Boolean isActive) { // Setter for isActive
        this.isActive = isActive;
    }
}
