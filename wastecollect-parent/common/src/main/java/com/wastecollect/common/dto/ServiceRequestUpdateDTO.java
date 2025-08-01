// common/dto/ServiceRequestUpdateDTO.java
package com.wastecollect.common.dto;

import com.wastecollect.common.utils.WasteType;
import java.time.LocalDateTime;

public class ServiceRequestUpdateDTO {

    private String description;
    private WasteType wasteType;
    private Double estimatedVolume;
    private LocalDateTime preferredDate;
    private String phone;
    private String address;
    private String comment;
    private Long collectorId; // To assign/reassign collector

    // Constructors
    public ServiceRequestUpdateDTO() {
    }

    public ServiceRequestUpdateDTO(String description, WasteType wasteType, Double estimatedVolume,
                                   LocalDateTime preferredDate, String phone, String address, String comment,
                                   Long collectorId) {
        this.description = description;
        this.wasteType = wasteType;
        this.estimatedVolume = estimatedVolume;
        this.preferredDate = preferredDate;
        this.phone = phone;
        this.address = address;
        this.comment = comment;
        this.collectorId = collectorId;
    }

    // Getters and Setters
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public WasteType getWasteType() {
        return wasteType;
    }

    public void setWasteType(WasteType wasteType) {
        this.wasteType = wasteType;
    }

    public Double getEstimatedVolume() {
        return estimatedVolume;
    }

    public void setEstimatedVolume(Double estimatedVolume) {
        this.estimatedVolume = estimatedVolume;
    }

    public LocalDateTime getPreferredDate() {
        return preferredDate;
    }

    public void setPreferredDate(LocalDateTime preferredDate) {
        this.preferredDate = preferredDate;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Long getCollectorId() {
        return collectorId;
    }

    public void setCollectorId(Long collectorId) {
        this.collectorId = collectorId;
    }
}