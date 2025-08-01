package com.wastecollect.common.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class MunicipalManagerCreationDTO extends UserDTO { // Extend UserDTO

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    @NotNull(message = "Municipality ID is required")
    private Long municipalityId;

    public MunicipalManagerCreationDTO() {
    }

    public MunicipalManagerCreationDTO(String firstName, String lastName, String email, String password,
                                       String phoneNumber, String address, Long municipalityId) {
        super(null, firstName, lastName, email, phoneNumber, address, null); // Pass values to UserDTO constructor
        this.password = password;
        this.municipalityId = municipalityId;
    }

    // Getters and Setters
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Long getMunicipalityId() {
        return municipalityId;
    }

    public void setMunicipalityId(Long municipalityId) {
        this.municipalityId = municipalityId;
    }
}