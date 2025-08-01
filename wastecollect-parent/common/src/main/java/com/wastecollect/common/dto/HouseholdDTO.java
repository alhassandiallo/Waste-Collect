package com.wastecollect.common.dto;

import com.wastecollect.common.models.Municipality;
import com.wastecollect.common.utils.HousingType;

public class HouseholdDTO {
	private Long id;
	private String firstName;
	private String lastName;
	private String email;
	// private String password; // Removed password field
	private String phoneNumber;
	private String address;
	private Double latitude; // Added latitude
	private Double longitude; // Added longitude
	private Integer numberOfMembers;
	private HousingType housingType; // Changed to HousingType enum as per clarification
	private String municipalityName; // Changed to String to store name()
	private String collectionPreferences;
	private int daysSinceLastCollection; // Added for underserved areas
	private int areaCoveragePercentage; // Added for underserved areas

	// Default constructor
	public HouseholdDTO() {
	}
	
	// Updated constructor: Now expects HousingType enum for housingType
	public HouseholdDTO(Long id, Integer numberOfMembers, HousingType housingType, Municipality area, String collectionPreferences) {
        this.id = id;
        this.numberOfMembers = numberOfMembers;
        this.housingType = housingType; // Directly assign HousingType enum
        this.municipalityName = area != null ? area.getMunicipalityName() : null; // Store municipality name as String
        this.collectionPreferences = collectionPreferences;
    }

	// Existing constructor with many fields (password removed)
	// Updated constructor: Now expects HousingType enum for housingType
	public HouseholdDTO(Long id, Integer numberOfMembers, HousingType housingType, Municipality area,
			String collectionPreferences, String firstName, String lastName, String email,
			String phoneNumber, String address) {
		this.id = id;
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		// this.password = password; // Removed password assignment
		this.phoneNumber = phoneNumber;
		this.address = address;
		this.numberOfMembers = numberOfMembers;
		this.housingType = housingType; // Directly assign HousingType enum
		this.municipalityName = area != null ? area.getMunicipalityName() : null;
		this.collectionPreferences = collectionPreferences;
	}

	// Existing constructor with fewer fields
	// Updated constructor: Now expects HousingType enum for housingType
	public HouseholdDTO(Long id2, Integer numberOfMembers2, HousingType housingType2, String collectionPreferences2) {
		this.id = id2;
		this.numberOfMembers = numberOfMembers2;
		this.housingType = housingType2; // Directly assign HousingType enum
		this.collectionPreferences = collectionPreferences2;
	}

	// NEW: Constructor for basic information (id, first name, last name)
	public HouseholdDTO(Long id, String firstName, String lastName) {
		this.id = id;
		this.firstName = firstName;
		this.lastName = lastName;
	}

	// NEW CONSTRUCTOR: Matches the arguments provided in getAllHouseholds() and similar service methods (password removed)
	// Updated constructor: Now expects HousingType enum for housingType
	public HouseholdDTO(Long id, String firstName, String lastName, String email, String phoneNumber, String address,
			Integer numberOfMembers, HousingType housingType, Municipality area, String collectionPreferences) {
		this.id = id;
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.phoneNumber = phoneNumber;
		this.address = address;
		this.numberOfMembers = numberOfMembers;
		this.housingType = housingType; // Directly assign HousingType enum
		this.municipalityName = area != null ? area.getMunicipalityName() : null;
		this.collectionPreferences = collectionPreferences;
	}

    // NEW CONSTRUCTOR ADDED TO RESOLVE THE ERROR: Accepts String for housingType and converts it
    public HouseholdDTO(Long id, String firstName, String lastName, String email, String phoneNumber, String address,
                        Double latitude, Double longitude, Integer numberOfMembers, String housingTypeString, // Accepts String
                        String collectionPreferences, String municipalityName,
                        int daysSinceLastCollection, int areaCoveragePercentage) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.numberOfMembers = numberOfMembers;
        // Convert String to HousingType enum
        this.housingType = housingTypeString != null ? HousingType.valueOf(housingTypeString) : null;
        this.collectionPreferences = collectionPreferences;
        this.municipalityName = municipalityName;
        this.daysSinceLastCollection = daysSinceLastCollection;
        this.areaCoveragePercentage = areaCoveragePercentage;
    }


	// Getters and setters
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

	/* Removed getPassword()
	public String getPassword() {
		return password;
	}
	*/

	/* Removed setPassword()
	public void setPassword(String password) {
		this.password = password;
	}
	*/

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

	public HousingType getHousingType() { // Return type is HousingType enum
		return housingType;
	}

	public void setHousingType(HousingType housingType) { // Parameter type is HousingType enum
		this.housingType = housingType;
	}

	// This getter is now for municipalityName, not Municipality object
	public String getMunicipalityName() {
		return municipalityName;
	}

	public void setMunicipalityName(String municipalityName) {
		this.municipalityName = municipalityName;
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

    public int getDaysSinceLastCollection() {
        return daysSinceLastCollection;
    }

    public void setDaysSinceLastCollection(int daysSinceLastCollection) {
        this.daysSinceLastCollection = daysSinceLastCollection;
    }

    public int getAreaCoveragePercentage() {
        return areaCoveragePercentage;
    }

    public void setAreaCoveragePercentage(int areaCoveragePercentage) {
        this.areaCoveragePercentage = areaCoveragePercentage;
    }
}
