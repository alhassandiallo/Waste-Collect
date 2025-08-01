package com.wastecollect.common.models;

import com.wastecollect.common.utils.RoleName;

import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Role {
    
    // Identifiant unique du rôle (clé primaire)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Nom du rôle (par exemple, ADMIN, COLLECTOR, HOUSEHOLD, MUNICIPALITY)
    @Enumerated(EnumType.STRING)
    @Column(name = "name", length = 50)
    private RoleName name;

    // Constructeur sans paramètres (nécessaire pour JPA)
    public Role() {}

    // Constructeur avec paramètres
    public Role(RoleName name) {
        this.name = name;
    }

    // Getters et setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public RoleName getName() {
        return name;
    }

    public void setName(RoleName name) {
        this.name = name;
    }
}