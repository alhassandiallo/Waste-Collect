package com.wastecollect.common.models;

import jakarta.persistence.*;
import java.time.LocalDate;

import com.wastecollect.common.utils.PeriodType;

@Entity
@Table(name = "statistics")
public class Statistics {

    // Unique identifier for the statistics (primary key)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Period type for the statistics (day, week, month, year)
    @Enumerated(EnumType.STRING)
    @Column(name = "period_type", length = 20, nullable = false)
    private PeriodType periodType;

    // Start date of the period
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    // End date of the period
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    // Total number of collections performed
    @Column(name = "total_collections")
    private Long totalCollections;

    // Total amount of waste collected (in kg)
    @Column(name = "total_waste_collected")
    private Double totalWasteCollected;

    // Average waste per collection (in kg)
    @Column(name = "average_waste_per_collection")
    private Double averageWastePerCollection;

    // Number of active households during the period
    @Column(name = "active_households")
    private Long activeHouseholds;

    // Number of active collectors during the period
    @Column(name = "active_collectors")
    private Long activeCollectors;

    // Many-to-one relationship with Municipality (the municipality associated with these statistics)
    @ManyToOne
    @JoinColumn(name = "municipality_id")
    private Municipality municipality;

    // No-argument constructor (required by JPA)
    public Statistics() {}

    // Parameterized constructor
    public Statistics(PeriodType periodType, LocalDate startDate, LocalDate endDate, Municipality municipality) {
        this.periodType = periodType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.municipality = municipality;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PeriodType getPeriodType() {
        return periodType;
    }

    public void setPeriodType(PeriodType periodType) {
        this.periodType = periodType;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Long getTotalCollections() {
        return totalCollections;
    }

    public void setTotalCollections(Long totalCollections) {
        this.totalCollections = totalCollections;
    }

    public Double getTotalWasteCollected() {
        return totalWasteCollected;
    }

    public void setTotalWasteCollected(Double totalWasteCollected) {
        this.totalWasteCollected = totalWasteCollected;
    }

    public Double getAverageWastePerCollection() {
        return averageWastePerCollection;
    }

    public void setAverageWastePerCollection(Double averageWastePerCollection) {
        this.averageWastePerCollection = averageWastePerCollection;
    }

    public Long getActiveHouseholds() {
        return activeHouseholds;
    }

    public void setActiveHouseholds(Long activeHouseholds) {
        this.activeHouseholds = activeHouseholds;
    }

    public Long getActiveCollectors() {
        return activeCollectors;
    }

    public void setActiveCollectors(Long activeCollectors) {
        this.activeCollectors = activeCollectors;
    }

    public Municipality getMunicipality() {
        return municipality;
    }

    public void setMunicipality(Municipality municipality) {
        this.municipality = municipality;
    }

    // Method to calculate and update statistics
    public void calculateAndUpdateStatistics(/* potentially pass services/repositories here or make this method part of a service */) {
        // This is a conceptual example. Actual implementation would involve database queries.

        // Example: Calculating total collections
        // long totalCollections = wasteCollectionService.countCollectionsInPeriod(startDate, endDate);
        // this.setTotalCollections(totalCollections);

        // Example: Calculating total waste collected
        // double totalWaste = wasteCollectionService.sumWasteCollectedInPeriod(startDate, endDate);
        // this.setTotalWasteCollected(totalWaste);

        // Example: Calculate active households
        // long activeHouseholds = householdService.countActiveHouseholdsInPeriod(startDate, endDate);
        // this.setActiveHouseholds(activeHouseholds);

        // You would typically call this method from a service layer,
        // and that service layer would inject the necessary repositories
        // to fetch data from the database.
    }
}