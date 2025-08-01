package com.wastecollect.common.dto;

import java.util.Map;

//ComparativeDataDTO.java
//Represents comparative analysis data for a municipality
public class ComparativeDataDTO {
	private MunicipalityDTO currentMunicipality;
	private String comparisonType; // e.g., "average", "top_performers", "specific_municipality"
	private Map<String, Object> currentMunicipalityData; // Key metrics for current municipality
	private Map<String, Object> comparativeMetrics; // Metrics for comparison (e.g., average values, another
													// municipality's data)
	private Map<String, Double> performanceRatios; // Ratios like current vs. average

	public ComparativeDataDTO() {
	}

	public ComparativeDataDTO(MunicipalityDTO currentMunicipality, String comparisonType,
			Map<String, Object> currentMunicipalityData, Map<String, Object> comparativeMetrics,
			Map<String, Double> performanceRatios) {
		this.currentMunicipality = currentMunicipality;
		this.comparisonType = comparisonType;
		this.currentMunicipalityData = currentMunicipalityData;
		this.comparativeMetrics = comparativeMetrics;
		this.performanceRatios = performanceRatios;
	}

	// Getters and Setters
	public MunicipalityDTO getCurrentMunicipality() {
		return currentMunicipality;
	}

	public void setCurrentMunicipality(MunicipalityDTO currentMunicipality) {
		this.currentMunicipality = currentMunicipality;
	}

	public String getComparisonType() {
		return comparisonType;
	}

	public void setComparisonType(String comparisonType) {
		this.comparisonType = comparisonType;
	}

	public Map<String, Object> getCurrentMunicipalityData() {
		return currentMunicipalityData;
	}

	public void setCurrentMunicipalityData(Map<String, Object> currentMunicipalityData) {
		this.currentMunicipalityData = currentMunicipalityData;
	}

	public Map<String, Object> getComparativeMetrics() {
		return comparativeMetrics;
	}

	public void setComparativeMetrics(Map<String, Object> comparativeMetrics) {
		this.comparativeMetrics = comparativeMetrics;
	}

	public Map<String, Double> getPerformanceRatios() {
		return performanceRatios;
	}

	public void setPerformanceRatios(Map<String, Double> performanceRatios) {
		this.performanceRatios = performanceRatios;
	}
}