package com.wastecollect.common.dto;

import com.wastecollect.common.utils.HousingType;
import com.wastecollect.common.utils.RoleName; // Import RoleName as HouseholdProfileDTO extends UserDTO

/**
 * DTO for representing a Household's profile.
 * Extends UserDTO to inherit common user fields and excludes sensitive information like password.
 */
public class HouseholdProfileDTO extends UserDTO { // Explicitly extends UserDTO

    private Integer numberOfMembers;
    private HousingType housingType;
    private String area; // Changed from municipalityName to area to match provided DTO
    private String collectionPreferences;
    private Double latitude;
    private Double longitude;
    private Boolean isActive; // Assuming isActive is a property you want to expose

    // Default constructor
    public HouseholdProfileDTO() {
        super(); // Call the superclass default constructor
    }

    /**
     * Parameterized constructor for creating a HouseholdProfileDTO.
     *
     * @param id The unique identifier of the household.
     * @param firstName The first name of the household contact.
     * @param lastName The last name of the household contact.
     * @param email The email address of the household contact.
     * @param phoneNumber The phone number of the household contact.
     * @param address The address of the household.
     * @param numberOfMembers The number of members in the household.
     * @param housingType The type of housing (e.g., APARTMENT, HOUSE).
     * @param area The geographical area of the household.
     * @param collectionPreferences Any specific collection preferences for the household.
     * @param latitude The latitude coordinate of the household's location.
     * @param longitude The longitude coordinate of the household's location.
     * @param isActive The active status of the household. // ADDED THIS PARAMETER
     */
    public HouseholdProfileDTO(Long id, String firstName, String lastName, String email,
                               String phoneNumber, String address, Integer numberOfMembers,
                               HousingType housingType, String area, String collectionPreferences,
                               Double latitude, Double longitude, Boolean isActive) { // ADDED isActive here
        // Call the superclass (UserDTO) constructor for common user fields,
        // and assign the HOUSEHOLD role.
        super(id, firstName, lastName, email, phoneNumber, address, RoleName.HOUSEHOLD);
        this.numberOfMembers = numberOfMembers;
        this.housingType = housingType;
        this.area = area;
        this.collectionPreferences = collectionPreferences;
        this.latitude = latitude;
        this.longitude = longitude;
        this.isActive = isActive; // Initialize isActive field
    }

    // Getters and Setters for Household-specific fields
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

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
