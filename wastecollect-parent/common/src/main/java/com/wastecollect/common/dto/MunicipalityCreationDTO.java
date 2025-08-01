package com.wastecollect.common.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public class MunicipalityCreationDTO {
    @NotBlank(message = "Municipality name is required")
    private String municipalityName;

    @NotBlank(message = "Province is required")
    private String province;
    @NotBlank(message = "Country is required")
    private String country;

    private Long population;
    private Double wasteManagementBudget;

    @NotBlank(message = "Manager first name is required")
    private String managerFirstName;
    @NotBlank(message = "Manager last name is required")
    private String managerLastName;
    @NotBlank(message = "Manager email is required")
    @Email(message = "Invalid manager email format")
    private String managerEmail;
    @NotBlank(message = "Manager password is required")
    @Size(min = 8, message = "Manager password must be at least 8 characters long")
    private String managerPassword;

    // Add these new fields for manager's phone number and address
    @NotBlank(message = "Manager phone number is required")
    private String managerPhoneNumber;
    private String managerAddress; // Address can be optional


    public MunicipalityCreationDTO() {
    }

    // Updated constructor to include city, province, country, managerPhoneNumber, managerAddress
    public MunicipalityCreationDTO(String municipalityName, String province, String country,
                                   Long population, Double wasteManagementBudget,
                                   String managerFirstName, String managerLastName, String managerEmail, String managerPassword,
                                   String managerPhoneNumber, String managerAddress) { // Added managerPhoneNumber, managerAddress
        this.municipalityName = municipalityName;
        this.province = province;
        this.country = country;
        this.population = population;
        this.wasteManagementBudget = wasteManagementBudget;
        this.managerFirstName = managerFirstName;
        this.managerLastName = managerLastName;
        this.managerEmail = managerEmail;
        this.managerPassword = managerPassword;
        this.managerPhoneNumber = managerPhoneNumber; // Initialize new field
        this.managerAddress = managerAddress; // Initialize new field
    }

    // Existing Getters and Setters...
    public String getMunicipalityName() {
        return municipalityName;
    }

    public void setMunicipalityName(String municipalityName) {
        this.municipalityName = municipalityName;
    }

    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public Long getPopulation() {
        return population;
    }

    public void setPopulation(Long population) {
        this.population = population;
    }

    public Double getWasteManagementBudget() {
        return wasteManagementBudget;
    }

    public void setWasteManagementBudget(Double wasteManagementBudget) {
        this.wasteManagementBudget = wasteManagementBudget;
    }

    public String getManagerFirstName() {
        return managerFirstName;
    }

    public void setManagerFirstName(String managerFirstName) {
        this.managerFirstName = managerFirstName;
    }

    public String getManagerLastName() {
        return managerLastName;
    }

    public void setManagerLastName(String managerLastName) {
        this.managerLastName = managerLastName;
    }

    public String getManagerEmail() {
        return managerEmail;
    }

    public void setManagerEmail(String managerEmail) {
        this.managerEmail = managerEmail;
    }

    public String getManagerPassword() {
        return managerPassword;
    }

    public void setManagerPassword(String managerPassword) {
        this.managerPassword = managerPassword;
    }

    // New getters and setters for managerPhoneNumber and managerAddress
    public String getManagerPhoneNumber() {
        return managerPhoneNumber;
    }

    public void setManagerPhoneNumber(String managerPhoneNumber) {
        this.managerPhoneNumber = managerPhoneNumber;
    }

    public String getManagerAddress() {
        return managerAddress;
    }

    public void setManagerAddress(String managerAddress) {
        this.managerAddress = managerAddress;
    }
}