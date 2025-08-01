package com.wastecollect.common.dto;

import com.wastecollect.common.utils.RoleName;

public class MunicipalManagerProfileDTO extends UserDTO { // Extend UserDTO

    private Long municipalityId;
    private String municipalityName;

    public MunicipalManagerProfileDTO() {
        super();
    }

    public MunicipalManagerProfileDTO(Long id, String firstName, String lastName, String email,
                                      String phoneNumber, String address, Long municipalityId, String municipalityName) {
        super(id, firstName, lastName, email, phoneNumber, address, RoleName.MUNICIPAL_MANAGER); // Pass to UserDTO constructor
        this.municipalityId = municipalityId;
        this.municipalityName = municipalityName;
    }

    // Getters and Setters
    public Long getMunicipalityId() {
        return municipalityId;
    }

    public void setMunicipalityId(Long municipalityId) {
        this.municipalityId = municipalityId;
    }

    public String getMunicipalityName() {
        return municipalityName;
    }

    public void setMunicipalityName(String municipalityName) {
        this.municipalityName = municipalityName;
    }
}