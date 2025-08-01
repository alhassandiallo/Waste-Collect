// MunicipalityDTO.java
package com.wastecollect.common.dto;

public class MunicipalityDTO {
    private Long id;
    private String municipalityName;
    private String province;
    private String country;
    private Long population;
    private Double wasteManagementBudget;
    private Boolean enabled;
    private MunicipalManagerProfileDTO manager;

    // Default constructor
    public MunicipalityDTO() {
    }

    // Constructor with fields, excluding coverageArea and city
    public MunicipalityDTO(Long id, String municipalityName, String province, String country,
                           Long population, Double wasteManagementBudget) {
        this.id = id;
        this.municipalityName = municipalityName;
        this.province = province;
        this.country = country;
        this.population = population;
        this.wasteManagementBudget = wasteManagementBudget;
    }
    
    public MunicipalityDTO(Long id, String municipalityName, String province, String country,
            Long population, Double wasteManagementBudget, Boolean enabled) { // Updated constructor
		this.id = id;
		this.municipalityName = municipalityName;
		this.province = province;
		this.country = country;
		this.population = population;
		this.wasteManagementBudget = wasteManagementBudget;
		this.enabled = enabled; // Initialize enabled
	}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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
	
    public Boolean getEnabled() { // Getter for enabled
        return enabled;
    }

    public void setEnabled(Boolean enabled) { // Setter for enabled
        this.enabled = enabled;
    }

	public MunicipalManagerProfileDTO getManager() {
		return manager;
	}

	public void setManager(MunicipalManagerProfileDTO manager) {
		this.manager = manager;
	}
}