package com.wastecollect.common.models;

import jakarta.persistence.*;
import java.util.Set;

import com.wastecollect.common.utils.CollectorStatus;

@Entity
@DiscriminatorValue("COLLECTOR")
public class Collector extends User {
    
    // Collector's identification number (e.g., badge number)
    // This field will be manually set by the service layer with the "CO-XXXXX" format
    @Column(name = "collector_id", unique = true, nullable = false)
    private String collectorId;
    
    // Collector's status (active, inactive, on leave)
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private CollectorStatus status;
    
    // Security alert threshold for the collector
    @Column(name = "alert_threshold")
    private Integer alertThreshold;
    
    // Security alert status for the collector
    @Column(name = "alert_status")
    private Boolean alertStatus = false;
    
    // One-to-many relationship with ServiceRequest for service requests assigned to the collector
    @OneToMany(mappedBy = "collector", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ServiceRequest> serviceRequests;
    
    @ManyToOne
    @JoinColumn(name = "municipality_id")
    private Municipality municipality;

    // No-argument constructor (required by JPA and used when creating new instances in service)
    public Collector() {
        super(); // Call default constructor of User to ensure base User fields are initialized
    }

    // Parameterized constructor for convenience when creating a Collector with initial User data
    // Note: collectorId is NOT passed here, it will be generated and set by AdminService after initial save
    public Collector(String firstName, String lastName, String email, String password, String phoneNumber, String address, CollectorStatus status, Municipality municipality) {
        super(firstName, lastName, email, password, phoneNumber, address);
        this.status = status;
        this.municipality = municipality;
        // The collectorId will be set by the service layer after the user is persisted and an ID is available.
    }

    // This constructor is removed as it was redundant and could cause confusion.
    // public Collector(String collectorId, CollectorStatus status) {
    // 	 this.collectorId = collectorId;
    //      this.status = status;
	// }

	// Getters and setters
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

    public Integer getAlertThreshold() {
        return alertThreshold;
    }

    public void setAlertThreshold(Integer alertThreshold) {
        this.alertThreshold = alertThreshold;
    }

    public Boolean getAlertStatus() {
        return alertStatus;
    }

    public void setAlertStatus(Boolean alertStatus) {
        this.alertStatus = alertStatus;
    }

    public Set<ServiceRequest> getServiceRequests() {
        return serviceRequests;
    }

    public void setServiceRequests(Set<ServiceRequest> serviceRequests) {
        this.serviceRequests = serviceRequests;
    }
    
    public Municipality getMunicipality() {
        return municipality;
    }

    public void setMunicipality(Municipality municipality) {
        this.municipality = municipality;
    }
}
