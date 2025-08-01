package com.wastecollect.common.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.wastecollect.common.utils.ServiceRequestStatus;

@Entity
@Table(name = "waste_collections")
public class WasteCollection {
    
    // Unique identifier for the waste collection (primary key)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Date and time of the collection
    @Column(name = "collection_date", nullable = false)
    private LocalDateTime collectionDate;
    
    // Actual weight of waste collected (in kg)
    @Column(name = "actual_weight")
    private Double actualWeight;
    
    @Column(name = "adresse", nullable = false)
    private String addresse;
    
    // Geographical coordinates of the collection point
    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;
    
    // Rating given by the household for the collector (1 to 5)
    @Column(name = "collector_rating")
    private Integer collectorRating;
    
    // Comment from the household for the collector
    @Column(name = "collector_comment", length = 500)
    private String collectorComment;
    
    // Many-to-one relationship with ServiceRequest (the associated service request)
    @ManyToOne
    @JoinColumn(name = "service_request_id")
    private ServiceRequest serviceRequest;
    
    // Many-to-one relationship with Collector (the collector who performed the collection)
    @ManyToOne
    @JoinColumn(name = "collector_id")
    private Collector collector;
    
    // Many-to-one relationship with Household (the household that created the request)
    @ManyToOne
    @JoinColumn(name = "household_id")
    private Household household;
    
    // Many-to-one relationship with Municipality (the municipality related to the request)
    @ManyToOne
    @JoinColumn(name = "municipality_id")
    private Municipality municipality;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private ServiceRequestStatus status;

    // No-argument constructor (required by JPA)
    public WasteCollection() {}

    // Parameterized constructor
    public WasteCollection(LocalDateTime collectionDate, Double actualWeight, ServiceRequest serviceRequest, Collector collector, Household household, Municipality municipality, Double latitude, Double longitude, String addresse) {
        this.collectionDate = collectionDate;
        this.actualWeight = actualWeight;
        this.addresse = addresse;
        this.latitude = latitude;
        this.longitude = longitude;
        this.serviceRequest = serviceRequest;
        this.collector = collector;
        this.household = household;
        this.municipality = municipality;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getCollectionDate() {
        return collectionDate;
    }

    public void setCollectionDate(LocalDateTime collectionDate) {
        this.collectionDate = collectionDate;
    }

    public Double getActualWeight() {
        return actualWeight;
    }

    public void setActualWeight(Double actualWeight) {
        this.actualWeight = actualWeight;
    }

    public String getAddresse() {
        return addresse;
    }

    public void setAddresse(String addresse) {
        this.addresse = addresse;
    }

    public Integer getCollectorRating() {
        return collectorRating;
    }

    public void setCollectorRating(Integer collectorRating) {
        this.collectorRating = collectorRating;
    }

    public String getCollectorComment() {
        return collectorComment;
    }

    public void setCollectorComment(String collectorComment) {
        this.collectorComment = collectorComment;
    }

    public ServiceRequest getServiceRequest() {
        return serviceRequest;
    }

    public void setServiceRequest(ServiceRequest serviceRequest) {
        this.serviceRequest = serviceRequest;
    }

    public Collector getCollector() {
        return collector;
    }

    public void setCollector(Collector collector) {
        this.collector = collector;
    }

    public Household getHousehold() {
        return household;
    }

    public void setHousehold(Household household) {
        this.household = household;
    }

    public Municipality getMunicipality() {
        return municipality;
    }

    public void setMunicipality(Municipality municipality) {
        this.municipality = municipality;
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

	public ServiceRequestStatus getStatus() {
		return status;
	}

	public void setStatus(ServiceRequestStatus status) {
		this.status = status;
	}
}