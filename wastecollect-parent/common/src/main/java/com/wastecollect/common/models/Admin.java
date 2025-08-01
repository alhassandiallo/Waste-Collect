package com.wastecollect.common.models;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("ADMIN")
public class Admin extends User {

    // Remove the redundant @Id and @GeneratedValue
    // private Long id;

    @Column(name = "position", length = 100)
    private String position;

    @Column(name = "management_area")
    private String managementArea;

    public Admin() {}

    public Admin(String firstName, String lastName, String email, String password, String phoneNumber, String address, String position, String managementArea) {
        super(firstName, lastName, email, password, phoneNumber, address);
        this.position = position;
        this.managementArea = managementArea;
    }

    // Remove this constructor if not used, or make it call super() with default user values
    public Admin(String position2, String managementArea2) {
        this.position = position2;
        this.managementArea = managementArea2;
    }

    // Getters and setters (existing)
    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getManagementArea() {
        return managementArea;
    }

    public void setManagementArea(String managementArea) {
        this.managementArea = managementArea;
    }
}