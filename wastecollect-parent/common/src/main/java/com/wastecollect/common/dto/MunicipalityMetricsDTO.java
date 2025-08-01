package com.wastecollect.common.dto;

//MunicipalityMetricsDTO.java
//Represents key performance indicators for a municipality's waste management
public class MunicipalityMetricsDTO {
	private Long totalHouseholds;
	private Long activeHouseholds;
	private Long totalCollectors;
	private Long activeCollectors;
	private Double averageResponseTimeHours; // Avg time from request creation to completion
	private Double averageCollectionRating; // Avg rating from households
	private Long totalDisputes;

	public MunicipalityMetricsDTO() {
	}

	public MunicipalityMetricsDTO(Long totalHouseholds, Long activeHouseholds, Long totalCollectors,
			Long activeCollectors, Double averageResponseTimeHours, Double averageCollectionRating,
			Long totalDisputes) {
		this.totalHouseholds = totalHouseholds;
		this.activeHouseholds = activeHouseholds;
		this.totalCollectors = totalCollectors;
		this.activeCollectors = activeCollectors;
		this.averageResponseTimeHours = averageResponseTimeHours;
		this.averageCollectionRating = averageCollectionRating;
		this.totalDisputes = totalDisputes;
	}

	// Getters and Setters
	public Long getTotalHouseholds() {
		return totalHouseholds;
	}

	public void setTotalHouseholds(Long totalHouseholds) {
		this.totalHouseholds = totalHouseholds;
	}

	public Long getActiveHouseholds() {
		return activeHouseholds;
	}

	public void setActiveHouseholds(Long activeHouseholds) {
		this.activeHouseholds = activeHouseholds;
	}

	public Long getTotalCollectors() {
		return totalCollectors;
	}

	public void setTotalCollectors(Long totalCollectors) {
		this.totalCollectors = totalCollectors;
	}

	public Long getActiveCollectors() {
		return activeCollectors;
	}

	public void setActiveCollectors(Long activeCollectors) {
		this.activeCollectors = activeCollectors;
	}

	public Double getAverageResponseTimeHours() {
		return averageResponseTimeHours;
	}

	public void setAverageResponseTimeHours(Double averageResponseTimeHours) {
		this.averageResponseTimeHours = averageResponseTimeHours;
	}

	public Double getAverageCollectionRating() {
		return averageCollectionRating;
	}

	public void setAverageCollectionRating(Double averageCollectionRating) {
		this.averageCollectionRating = averageCollectionRating;
	}

	public Long getTotalDisputes() {
		return totalDisputes;
	}

	public void setTotalDisputes(Long totalDisputes) {
		this.totalDisputes = totalDisputes;
	}
}
