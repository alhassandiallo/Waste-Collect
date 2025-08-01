package com.wastecollect.common.dto;

import com.wastecollect.common.utils.RoleName;

/**
 * DTO for representing an Administrator's profile.
 * Extends UserDTO to inherit common user fields and excludes sensitive information like password.
 */
public class AdminProfileDTO extends UserDTO {

    // No additional fields specific to Admin are added here for a basic profile.
    // If Admin had unique properties (e.g., admin permissions level), they would go here.

    public AdminProfileDTO() {
        super(); // Call the superclass default constructor
    }

    /**
     * Parameterized constructor for creating an AdminProfileDTO.
     * Inherits most fields directly from UserDTO.
     * @param id The unique identifier of the admin.
     * @param firstName The first name of the admin.
     * @param lastName The last name of the admin.
     * @param email The email address of the admin.
     * @param phoneNumber The phone number of the admin.
     * @param address The address of the admin.
     */
    public AdminProfileDTO(Long id, String firstName, String lastName, String email,
                           String phoneNumber, String address) {
        super(id, firstName, lastName, email, phoneNumber, address, RoleName.ADMIN); // Explicitly set role as ADMIN
    }

    // No specific getters/setters needed if no new fields are added.
    // Inherits getters/setters from UserDTO.
}
