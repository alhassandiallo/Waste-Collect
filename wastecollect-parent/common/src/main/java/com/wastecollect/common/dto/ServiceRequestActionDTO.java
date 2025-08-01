// backend/src/main/java/com/wastecollect/common/dto/ServiceRequestActionDTO.java
package com.wastecollect.common.dto;

/**
 * DTO for actions on service requests (accept, reject, complete).
 * Includes fields for notes/reasons and optionally for location/weight for completion.
 */
public class ServiceRequestActionDTO {

    private String note; // For accept/complete
    private String reason; // For reject

    // New fields for collection completion (optional)
    private Double actualWeight;
    private Double latitude;
    private Double longitude;

    public ServiceRequestActionDTO() {
    }

    // Constructor for notes/reasons (existing usage)
    public ServiceRequestActionDTO(String note, String reason) {
        this.note = note;
        this.reason = reason;
    }

    // Constructor for completion action
    public ServiceRequestActionDTO(String note, Double actualWeight, Double latitude, Double longitude) {
        this.note = note;
        this.actualWeight = actualWeight;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    // Getters and Setters for all fields
    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Double getActualWeight() {
        return actualWeight;
    }

    public void setActualWeight(Double actualWeight) {
        this.actualWeight = actualWeight;
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

    @Override
    public String toString() {
        return "ServiceRequestActionDTO{" +
               "note='" + note + '\'' +
               ", reason='" + reason + '\'' +
               ", actualWeight=" + actualWeight +
               ", latitude=" + latitude +
               ", longitude=" + longitude +
               '}';
    }
}
