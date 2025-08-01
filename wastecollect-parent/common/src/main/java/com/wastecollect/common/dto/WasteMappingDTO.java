package com.wastecollect.common.dto;

import java.util.List;

//WasteMappingDTO.java
//Contains a list of map points for waste-related geographical visualization
public class WasteMappingDTO {
	private List<MapPointDTO> mapPoints;

	public WasteMappingDTO() {
	}

	public WasteMappingDTO(List<MapPointDTO> mapPoints) {
		this.mapPoints = mapPoints;
	}

	// Getters and Setters
	public List<MapPointDTO> getMapPoints() {
		return mapPoints;
	}

	public void setMapPoints(List<MapPointDTO> mapPoints) {
		this.mapPoints = mapPoints;
	}
}
