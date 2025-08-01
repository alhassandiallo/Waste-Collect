package com.wastecollect.common.models;

import jakarta.persistence.*;
import java.util.HashSet;

@Entity
@DiscriminatorValue("MUNICIPAL_MANAGER")
public class MunicipalManager extends User {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "municipality_id", nullable = false)
    private Municipality municipality;

    // Default constructor (required by JPA)
    public MunicipalManager() {
        super();
        // Removed role assignment from here. It will be handled in the service.
        // Ensure the roles set is initialized if not already by User's default
        if (this.getRoles() == null) {
            this.setRoles(new HashSet<>());
        }
    }

    // Parameterized constructor for creating a new MunicipalManager
    public MunicipalManager(String firstName, String lastName, String email, String password,
                            String phoneNumber, String address, Municipality municipality) {
        super(firstName, lastName, email, password, phoneNumber, address);
        this.municipality = municipality;
        // Removed role assignment from here. It will be handled in the service.
        // Ensure the roles set is initialized if not already by User's default
        if (this.getRoles() == null) {
            this.setRoles(new HashSet<>());
        }
    }

    // Getter for municipality
    public Municipality getMunicipality() {
        return municipality;
    }

    // Setter for municipality
    public void setMunicipality(Municipality municipality) {
        this.municipality = municipality;
    }
}