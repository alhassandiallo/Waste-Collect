package com.wastecollect.common.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.wastecollect.common.utils.DisputeStatus;

@Entity
@Table(name = "disputes")
public class Dispute {
    
    // Identifiant unique du litige (clé primaire)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Description du litige
    @Column(name = "description", length = 500)
    private String description;
    
    // Statut du litige (ouvert, en cours, résolu, fermé)
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private DisputeStatus status;
    
    // Date et heure de création du litige
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Date et heure de mise à jour du litige
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relation many-to-one avec User (l'utilisateur qui a soulevé le litige)
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    // Relation many-to-one avec ServiceRequest (la demande de service associée au litige)
    @ManyToOne
    @JoinColumn(name = "service_request_id")
    private ServiceRequest serviceRequest;
    
    // Relation many-to-one avec Payment (le paiement associé au litige)
    @ManyToOne
    @JoinColumn(name = "payment_id")
    private Payment payment;
    
    @Column(name = "title")
    private String title;

	@Column(name = "alert_read")
    private boolean read;

	// No-argument constructor (required by JPA)
    public Dispute() {}

    // Parameterized constructor
    public Dispute(String description, User user, ServiceRequest serviceRequest, Payment payment) {
        this.description = description;
        this.user = user;
        this.serviceRequest = serviceRequest;
        this.payment = payment;
        this.status = DisputeStatus.OPEN;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Dispute(String description2, DisputeStatus status2, LocalDateTime createdAt2, LocalDateTime updatedAt2) {
    	 this.description = description2;
         this.status = status2;
         this.createdAt = createdAt2;
         this.updatedAt = updatedAt2;
	}

	// Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public DisputeStatus getStatus() {
        return status;
    }

    public void setStatus(DisputeStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public ServiceRequest getServiceRequest() {
        return serviceRequest;
    }

    public void setServiceRequest(ServiceRequest serviceRequest) {
        this.serviceRequest = serviceRequest;
    }

    public Payment getPayment() {
        return payment;
    }

    public void setPayment(Payment payment) {
        this.payment = payment;
    }
    
    public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}
    
    public boolean isRead() {
		return read;
	}

	public void setRead(boolean read) {
		this.read = read;
	}

    // Method to update dispute status
    public void updateDisputeStatus(DisputeStatus newStatus) {
        this.status = newStatus;
        this.updatedAt = LocalDateTime.now();
    }
}