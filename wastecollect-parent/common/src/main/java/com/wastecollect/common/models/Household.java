package com.wastecollect.common.models;

import jakarta.persistence.*;
import java.time.LocalDateTime; // Import LocalDateTime
import java.util.Set;

import com.wastecollect.common.utils.HousingType;

@Entity
@DiscriminatorValue("HOUSEHOLD")
public class Household extends User {

    // ID field REMOVED from here. It will be inherited from the User superclass.

    // Nombre de membres dans le ménage
    @Column(name = "number_of_members")
    private Integer numberOfMembers;

    // Type de logement (maison, appartement, etc.)
    @Enumerated(EnumType.STRING)
    @Column(name = "housing_type", length = 50)
    private HousingType housingType;

    // Zone géographique du ménage
    @ManyToOne
    @JoinColumn(name = "municipality_id")
    private Municipality municipality;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "is_active")
    private Boolean isActive;

    // New field to track the last collection date for a household
    // This will be used by Spring Data JPA to infer queries like 'countByLastCollectionDateLessThan'
    @Column(name = "last_collection_date")
    private LocalDateTime lastCollectionDate;

    // Préférences de collecte (par exemple, jours de prédilection)
    @Column(name = "collection_preferences")
    private String collectionPreferences;

    // Relation one-to-many avec ServiceRequest pour les demandes de service créées par le ménage
    @OneToMany(mappedBy = "household", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ServiceRequest> serviceRequests;


    // Constructeur sans paramètres (nécessaire pour JPA)
    public Household() {}

    // IMPORTANT: Updated this constructor to include 'isActive'
    public Household(String firstName, String lastName, String email, String password, String phoneNumber, String address,
                     Integer numberOfMembers, HousingType housingType, Municipality municipality,
                     String collectionPreferences, Double latitude, Double longitude, Boolean isActive) {
        super(firstName, lastName, email, password, phoneNumber, address);
        this.numberOfMembers = numberOfMembers;
        this.housingType = housingType;
        this.municipality = municipality;
        this.latitude = latitude;
        this.longitude = longitude;
        this.collectionPreferences = collectionPreferences;
        this.isActive = isActive; // Initialize isActive here
        this.lastCollectionDate = null; // Initialize as null or current date if first collection isn't recorded
    }

    public Household(Integer numberOfMembers2, HousingType housingType2, Municipality area2) {
        this.numberOfMembers = numberOfMembers2;
        this.housingType = housingType2;
        this.municipality = area2;
    }

    public Household(String firstName, String lastName, String email, String encodedPassword, String phoneNumber, String address,
            Integer numberOfMembers2, HousingType housingType2, Municipality municipality2) {
        super(firstName, lastName, email, encodedPassword, phoneNumber, address);
        this.numberOfMembers = numberOfMembers2;
        this.housingType = housingType2;
        this.municipality = municipality2;
        this.lastCollectionDate = null; // Initialize as null
    }

    // Getters et setters
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

    public Municipality getMunicipality() {
        return municipality;
    }

    public void setMunicipality(Municipality municipality) {
        this.municipality = municipality;
    }

    // getId() and setId() are now inherited from the User class.

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getCollectionPreferences() {
        return collectionPreferences;
    }

    public void setCollectionPreferences(String collectionPreferences) {
        this.collectionPreferences = collectionPreferences;
    }

    public Set<ServiceRequest> getServiceRequests() {
        return serviceRequests;
    }

    public void setServiceRequests(Set<ServiceRequest> serviceRequests) {
        this.serviceRequests = serviceRequests;
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

    // New getter and setter for lastCollectionDate
    public LocalDateTime getLastCollectionDate() {
        return lastCollectionDate;
    }

    public void setLastCollectionDate(LocalDateTime lastCollectionDate) {
        this.lastCollectionDate = lastCollectionDate;
    }
}
