package com.wastecollect.common.dto;

import com.wastecollect.common.utils.WasteType;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class WastePatternDTO {
	private WasteType wasteType;
	private Double averageVolume;
	private LocalDateTime startDate;
	private LocalDateTime endDate;
	private Integer frequencyDays;

	// Constructor, Getters, and Setters
	public WastePatternDTO() {
	}

	public WastePatternDTO(WasteType wasteType, Double averageVolume, LocalDateTime startDate, LocalDateTime endDate,
			Integer frequencyDays) {
		this.wasteType = wasteType;
		this.averageVolume = averageVolume;
		this.startDate = startDate;
		this.endDate = endDate;
		this.frequencyDays = frequencyDays;
	}

	// Getters and Setters
	public WasteType getWasteType() {
		return wasteType;
	}

	public void setWasteType(WasteType wasteType) {
		this.wasteType = wasteType;
	}

	public Double getAverageVolume() {
		return averageVolume;
	}

	public void setAverageVolume(Double averageVolume) {
		this.averageVolume = averageVolume;
	}

	public LocalDateTime getStartDate() {
		return startDate;
	}

	public void setStartDate(LocalDateTime startDate) {
		this.startDate = startDate;
	}

	public LocalDateTime getEndDate() {
		return endDate;
	}

	public void setEndDate(LocalDateTime endDate) {
		this.endDate = endDate;
	}

	public Integer getFrequencyDays() {
		return frequencyDays;
	}

	public void setFrequencyDays(Integer frequencyDays) {
		this.frequencyDays = frequencyDays;
	}
}