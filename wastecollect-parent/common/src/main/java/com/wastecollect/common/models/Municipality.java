// Municipality.java
package com.wastecollect.common.models;

import jakarta.persistence.*;
import java.util.Set;

@Entity
@Table(name = "municipalities") // Changed from @DiscriminatorValue("MUNICIPALITY")
public class Municipality { // No longer extends User directly, manages its own ID

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "municipality_name", nullable = false)
    private String municipalityName;

    @Column(name = "province")
    private String province;

    @Column(name = "country")
    private String country;

    @Column(name = "population")
    private Long population;

    @Column(name = "waste_management_budget")
    private Double wasteManagementBudget;

    @OneToMany(mappedBy = "municipality", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ServiceRequest> serviceRequests;
    
    @Column(name = "enabled") // Add this line
    private Boolean enabled; // Add this line

    // No-argument constructor
    public Municipality() {
    }

    // Constructor with parameters, excluding coverageArea and city
    public Municipality(String municipalityName, String province, String country,
                        Long population, Double wasteManagementBudget) {
        this.municipalityName = municipalityName;
        this.province = province;
        this.country = country;
        this.population = population;
        this.wasteManagementBudget = wasteManagementBudget;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
    
 // Add getter and setter for enabled
    public Boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
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

    public Set<ServiceRequest> getServiceRequests() {
        return serviceRequests;
    }

    public void setServiceRequests(Set<ServiceRequest> serviceRequests) {
        this.serviceRequests = serviceRequests;
    }
}