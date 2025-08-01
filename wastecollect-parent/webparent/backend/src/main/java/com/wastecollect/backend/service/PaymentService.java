// backend/service/PaymentService.java
package com.wastecollect.backend.service;

import com.wastecollect.common.dto.PaymentDTO;
import com.wastecollect.common.models.Payment;
import com.wastecollect.backend.repository.PaymentRepository;
import com.wastecollect.backend.exception.ResourceException; // Assuming this exception exists
import com.wastecollect.common.utils.PaymentMethod;
import com.wastecollect.common.utils.PaymentStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Import for @Transactional

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    // Assuming you have HouseholdRepository, ServiceRequestRepository, CollectorRepository
    // for mapping IDs to entities during creation if needed, or if DTO directly sends IDs.

    @Transactional
    public void processPayment(PaymentDTO paymentDTO) {
        // In a real scenario, you'd fetch Household, ServiceRequest, Collector entities
        // based on the IDs provided in paymentDTO, if they are not already linked in the DTO
        // For MVP, we'll assume the DTO directly contains necessary info or relationships are set.
        Payment newPayment = new Payment(
                paymentDTO.getAmount(),
                paymentDTO.getPaymentMethod(),
                paymentDTO.getStatus() != null ? paymentDTO.getStatus() : PaymentStatus.PENDING, // Default to PENDING
                paymentDTO.getPaymentDate() != null ? paymentDTO.getPaymentDate() : LocalDateTime.now(), // Default to now
                paymentDTO.getTransactionReference()
        );
        // Set relationships if the PaymentDTO includes IDs
        // newPayment.setHousehold(householdRepository.findById(paymentDTO.getHouseholdId()).orElse(null));
        // newPayment.setServiceRequest(serviceRequestRepository.findById(paymentDTO.getServiceRequestId()).orElse(null));
        // newPayment.setCollector(collectorRepository.findById(paymentDTO.getCollectorId()).orElse(null));

        paymentRepository.save(newPayment);
    }

    public List<PaymentDTO> getPaymentHistory() {
        List<Payment> payments = paymentRepository.findAll();
        return payments.stream()
                .map(this::convertToDto) // Use helper method for conversion
                .collect(Collectors.toList());
    }

    public PaymentDTO getPaymentStatus(Long id) {
        Payment payment = paymentRepository.findById(id)
                            .orElseThrow(() -> new ResourceException("Payment", id.toString()));
        return convertToDto(payment);
    }

    // Logic to generate financial report (basic implementation for MVP)
    public PaymentDTO generateFinancialReport(String periodType) {
        // This method should return aggregated data, not a single PaymentDTO
        // Example: total revenue, number of successful payments, etc.
        // For MVP, return a dummy DTO, or calculate based on all payments
        // This should probably be a dedicated "ReportDTO" or "FinancialSummaryDTO"
        // For now, let's just count total payments
        long totalPayments = paymentRepository.count();
        // You'll need more specific queries here, e.g., sum of amounts, counts by status
        System.out.println("Total payments for financial report: " + totalPayments);
        return new PaymentDTO(); // Placeholder
    }

    // Logic to get payment statistics (basic implementation for MVP)
    public PaymentDTO getPaymentStatistics() {
        // This should also return aggregated data, similar to generateFinancialReport
        long successfulPayments = paymentRepository.countByStatus(PaymentStatus.SUCCESSFUL);
        long failedPayments = paymentRepository.countByStatus(PaymentStatus.FAILED);
        // You'll need more complex statistics here.
        System.out.println("Successful payments: " + successfulPayments + ", Failed payments: " + failedPayments);
        return new PaymentDTO(); // Placeholder
    }

    // Improved getPaymentHistoryForHousehold with filtering and pagination
    public Page<PaymentDTO> getPaymentHistoryForHousehold(
            Long householdId,
            String status, // Can be null
            String paymentMethod, // Can be null
            LocalDate startDate, // Can be null
            LocalDate endDate, // Can be null
            String searchReference, // Can be null
            Pageable pageable // For pagination
    ) {
        // You'll need to define a custom query in PaymentRepository or use Specifications
        // For the MVP, a simple query example:
        Page<Payment> payments;

        // In a real scenario, you would build a dynamic query based on non-null parameters
        if (householdId != null) {
            payments = paymentRepository.findByHouseholdIdAndFilters(
                householdId,
                status != null ? PaymentStatus.valueOf(status.toUpperCase()) : null,
                paymentMethod != null ? PaymentMethod.valueOf(paymentMethod.toUpperCase()) : null,
                startDate != null ? startDate.atStartOfDay() : null,
                endDate != null ? endDate.atTime(23, 59, 59) : null, // End of day
                searchReference,
                pageable
            );
        } else {
            // Or handle a scenario where householdId is not provided (e.g., admin viewing all)
            payments = paymentRepository.findAll(pageable); // Fallback for demonstration
        }

        return payments.map(this::convertToDto);
    }

    public byte[] generateReceipt(Long paymentId) {
        // Retrieve payment details
        Payment payment = paymentRepository.findById(paymentId)
                            .orElseThrow(() -> new ResourceException("Payment", paymentId.toString()));

        // Logic to generate a PDF or HTML receipt
        // For MVP, you can return a simple byte array representing a text or HTML string.
        String receiptContent = "Receipt for Payment ID: " + payment.getId() + "\n"
                              + "Amount: " + payment.getAmount() + "\n"
                              + "Method: " + payment.getPaymentMethod() + "\n"
                              + "Status: " + payment.getStatus() + "\n"
                              + "Date: " + payment.getPaymentDate() + "\n"
                              + "Ref: " + payment.getTransactionReference();
        return receiptContent.getBytes(); // Simplistic for MVP
    }

    // Helper method to convert Payment entity to PaymentDTO
    private PaymentDTO convertToDto(Payment payment) {
        return new PaymentDTO(
                payment.getId(),
                payment.getAmount(),
                payment.getPaymentMethod(),
                payment.getStatus(),
                payment.getPaymentDate(),
                payment.getTransactionReference(),
                payment.getHousehold() != null ? payment.getHousehold().getId() : null, // Add household ID
                payment.getServiceRequest() != null ? payment.getServiceRequest().getId() : null, // Add service request ID
                payment.getCollector() != null ? payment.getCollector().getId() : null // Add collector ID
        );
    }
}