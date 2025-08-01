package com.wastecollect.common.dto;

import jakarta.validation.constraints.NotNull;

public class MunicipalManagerUpdateDTO extends UserDTO { // Extend UserDTO

    @NotNull(message = "Municipality ID is required")
    private Long municipalityId;

    public MunicipalManagerUpdateDTO() {
    }

    public MunicipalManagerUpdateDTO(String firstName, String lastName, String email,
                                     String phoneNumber, String address, Long municipalityId) {
        super(null, firstName, lastName, email, phoneNumber, address, null); // Pass to UserDTO constructor
        this.municipalityId = municipalityId;
    }

    // Getters and Setters
    public Long getMunicipalityId() {
        return municipalityId;
    }

    public void setMunicipalityId(Long municipalityId) {
        this.municipalityId = municipalityId;
    }
}