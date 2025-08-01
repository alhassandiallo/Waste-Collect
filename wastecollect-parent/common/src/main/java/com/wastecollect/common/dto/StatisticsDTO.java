// common/dto/StatisticsDTO.java
package com.wastecollect.common.dto;

import com.wastecollect.common.utils.PeriodType;
import java.time.LocalDate;

public class StatisticsDTO {
    private Long id;
    private PeriodType periodType;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long totalCollections;
    private Double totalWasteCollected;
    private Double averageWastePerCollection;
    private Long activeHouseholds;
    private Long activeCollectors;
    private Long municipalityId; // Added municipality ID

    // Constructor, getters, and setters
    public StatisticsDTO() {
    }

    public StatisticsDTO(Long id, PeriodType periodType, LocalDate startDate, LocalDate endDate, Long totalCollections,
                         Double totalWasteCollected, Double averageWastePerCollection, Long activeHouseholds,
                         Long activeCollectors, Long municipalityId) { // Updated constructor
        this.id = id;
        this.periodType = periodType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalCollections = totalCollections;
        this.totalWasteCollected = totalWasteCollected;
        this.averageWastePerCollection = averageWastePerCollection;
        this.activeHouseholds = activeHouseholds;
        this.activeCollectors = activeCollectors;
        this.municipalityId = municipalityId;
    }
    
    public StatisticsDTO(Long id, PeriodType periodType, LocalDate startDate, LocalDate endDate, Long totalCollections,
            Double totalWasteCollected, Double averageWastePerCollection, Long activeHouseholds,
            Long activeCollectors) {
        this.id = id;
        this.periodType = periodType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalCollections = totalCollections;
        this.totalWasteCollected = totalWasteCollected;
        this.averageWastePerCollection = averageWastePerCollection;
        this.activeHouseholds = activeHouseholds;
        this.activeCollectors = activeCollectors;
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

    public Long getMunicipalityId() {
        return municipalityId;
    }

    public void setMunicipalityId(Long municipalityId) {
        this.municipalityId = municipalityId;
    }
}