package com.wastecollect.common.dto;

import java.util.List;

//DetailedReportDTO.java
//A comprehensive DTO for municipality reports, combining various statistics
public class DetailedReportDTO {
	private MunicipalityDTO municipalityInfo;
	private WasteCollectionDataDTO collectionData;
	private MunicipalityMetricsDTO metrics;
	private List<HouseholdDTO> underservedAreas; // Reusing HouseholdDTO for consistency
	// Add other relevant report sections as needed

	public DetailedReportDTO() {
	}

	public DetailedReportDTO(MunicipalityDTO municipalityInfo, WasteCollectionDataDTO collectionData,
			MunicipalityMetricsDTO metrics, List<HouseholdDTO> underservedAreas) {
		this.municipalityInfo = municipalityInfo;
		this.collectionData = collectionData;
		this.metrics = metrics;
		this.underservedAreas = underservedAreas;
	}

	// Getters and Setters
	public MunicipalityDTO getMunicipalityInfo() {
		return municipalityInfo;
	}

	public void setMunicipalityInfo(MunicipalityDTO municipalityInfo) {
		this.municipalityInfo = municipalityInfo;
	}

	public WasteCollectionDataDTO getCollectionData() {
		return collectionData;
	}

	public void setCollectionData(WasteCollectionDataDTO collectionData) {
		this.collectionData = collectionData;
	}

	public MunicipalityMetricsDTO getMetrics() {
		return metrics;
	}

	public void setMetrics(MunicipalityMetricsDTO metrics) {
		this.metrics = metrics;
	}

	public List<HouseholdDTO> getUnderservedAreas() {
		return underservedAreas;
	}

	public void setUnderservedAreas(List<HouseholdDTO> underservedAreas) {
		this.underservedAreas = underservedAreas;
	}
}
