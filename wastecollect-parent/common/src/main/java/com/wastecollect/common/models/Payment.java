package com.wastecollect.common.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.wastecollect.common.utils.PaymentMethod;
import com.wastecollect.common.utils.PaymentStatus;

@Entity
@Table(name = "payments")
public class Payment {
    
    // Unique identifier for the payment (primary key)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Payment amount
    @Column(name = "amount", nullable = false)
    private Double amount;
    
    // Payment method (mobile money, credit card, etc.)
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 50, nullable = false)
    private PaymentMethod paymentMethod;
    
    // Payment status (pending, successful, failed)
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private PaymentStatus status;
    
    // Payment date and time
    @Column(name = "payment_date", nullable = false)
    private LocalDateTime paymentDate;
    
    // Payment transaction reference
    @Column(name = "transaction_reference", length = 100, unique = true)
    private String transactionReference;
    
    // Many-to-one relationship with Household (the household that made the payment)
    @ManyToOne
    @JoinColumn(name = "household_id")
    private Household household;
    
    // Many-to-one relationship with ServiceRequest (the service request associated with the payment)
    @ManyToOne
    @JoinColumn(name = "service_request_id")
    private ServiceRequest serviceRequest;
    
    @ManyToOne
    @JoinColumn(name = "collector_id") // Assuming a foreign key column named 'collector_id'
    private Collector collector;

    // No-argument constructor (required by JPA)
    public Payment() {}

    // Parameterized constructor
    public Payment(Double amount, PaymentMethod paymentMethod, PaymentStatus status, LocalDateTime paymentDate, String transactionReference, Household household, ServiceRequest serviceRequest) {
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.status = status;
        this.paymentDate = paymentDate;
        this.transactionReference = transactionReference;
        this.household = household;
        this.serviceRequest = serviceRequest;
    }

    public Payment(Double amount2, PaymentMethod paymentMethod2, PaymentStatus status2, LocalDateTime paymentDate2,
			String transactionReference2) {
    	this.amount = amount2;
        this.paymentMethod = paymentMethod2;
        this.status = status2;
        this.paymentDate = paymentDate2;
	}

	public Payment(Double amount2, PaymentMethod paymentMethod2, PaymentStatus status2, LocalDateTime paymentDate2,
			String transactionReference2, Household byCurrentUser) {
		// TODO Auto-generated constructor stub
	}

	// Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }

    public Household getHousehold() {
        return household;
    }

    public void setHousehold(Household household) {
        this.household = household;
    }

    public ServiceRequest getServiceRequest() {
        return serviceRequest;
    }

    public void setServiceRequest(ServiceRequest serviceRequest) {
        this.serviceRequest = serviceRequest;
    }
    
    public Collector getCollector() {
        return collector;
    }

    public void setCollector(Collector collector) {
        this.collector = collector;
    }

    // Method to update payment status
    public void updatePaymentStatus(PaymentStatus newStatus) {
        this.status = newStatus;
    }
}