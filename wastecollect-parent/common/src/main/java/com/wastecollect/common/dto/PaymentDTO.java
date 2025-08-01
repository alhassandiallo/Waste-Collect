// common/dto/PaymentDTO.java
package com.wastecollect.common.dto;

import com.wastecollect.common.utils.PaymentMethod;
import com.wastecollect.common.utils.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import java.time.LocalDateTime;

public class PaymentDTO {
    private Long id;
    @NotNull(message = "Amount cannot be null")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private Double amount;
    @NotNull(message = "Payment method cannot be null")
    private PaymentMethod paymentMethod;
    @NotNull(message = "Payment status cannot be null")
    private PaymentStatus status;
    private LocalDateTime paymentDate;
    private String transactionReference;

    // Added fields for relationships
    private Long householdId;
    private Long serviceRequestId;
    private Long collectorId;

    public PaymentDTO() {
    }

    public PaymentDTO(Long id, Double amount, PaymentMethod paymentMethod, PaymentStatus status,
                      LocalDateTime paymentDate, String transactionReference) {
        this.id = id;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.status = status;
        this.paymentDate = paymentDate;
        this.transactionReference = transactionReference;
    }

    // New constructor including relationship IDs (consider using a builder for more complex DTOs)
    public PaymentDTO(Long id, Double amount, PaymentMethod paymentMethod, PaymentStatus status,
                      LocalDateTime paymentDate, String transactionReference, Long householdId,
                      Long serviceRequestId, Long collectorId) {
        this.id = id;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.status = status;
        this.paymentDate = paymentDate;
        this.transactionReference = transactionReference;
        this.householdId = householdId;
        this.serviceRequestId = serviceRequestId;
        this.collectorId = collectorId;
    }

    // Getters and setters (already existing)
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

    // New getters and setters for relationship IDs
    public Long getHouseholdId() {
        return householdId;
    }

    public void setHouseholdId(Long householdId) {
        this.householdId = householdId;
    }

    public Long getServiceRequestId() {
        return serviceRequestId;
    }

    public void setServiceRequestId(Long serviceRequestId) {
        this.serviceRequestId = serviceRequestId;
    }

    public Long getCollectorId() {
        return collectorId;
    }

    public void setCollectorId(Long collectorId) {
        this.collectorId = collectorId;
    }
}