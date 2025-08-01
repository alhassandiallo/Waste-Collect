package com.wastecollect.backend.controller;

import com.wastecollect.common.dto.PaymentDTO;



import com.wastecollect.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page; // Import Page
import org.springframework.data.domain.Pageable; 

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/payment")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // Payment management
    @PostMapping("/process")
    public ResponseEntity<String> processPayment(@RequestBody PaymentDTO payment) {
        paymentService.processPayment(payment);
        return ResponseEntity.ok("Payment processed successfully");
    }

    @GetMapping("/history")
    public ResponseEntity<List<PaymentDTO>> getPaymentHistory() {
        return ResponseEntity.ok(paymentService.getPaymentHistory());
    }

    @GetMapping("/status/{id}")
    public ResponseEntity<PaymentDTO> getPaymentStatus(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentStatus(id));
    }

    // Financial reports
    @GetMapping("/financial-report")
    public ResponseEntity<PaymentDTO> getFinancialReport(
            @RequestParam String periodType) {
        return ResponseEntity.ok(paymentService.generateFinancialReport(periodType));
    }

    // Payment statistics
    @GetMapping("/payment-stats")
    public ResponseEntity<PaymentDTO> getPaymentStatistics() {
        return ResponseEntity.ok(paymentService.getPaymentStatistics());
    }
    
 // Example for PaymentController.java
    @GetMapping("/history/household/{householdId}") // Add householdId for specific user history
    public ResponseEntity<Page<PaymentDTO>> getPaymentHistoryForHousehold( // Changed return type to Page<PaymentDTO>
            @PathVariable Long householdId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentMethod,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String searchReference,
            @PageableDefault(size = 10, sort = "paymentDate,desc") Pageable pageable) { // Added Pageable parameter with default values
        // Passed the pageable object to the service method
        Page<PaymentDTO> paymentHistoryPage = paymentService.getPaymentHistoryForHousehold(
            householdId, status, paymentMethod, startDate, endDate, searchReference, pageable
        );
        return ResponseEntity.ok(paymentHistoryPage);
    }
    
 // Example for PaymentController.java
    @GetMapping("/receipt/{paymentId}")
    public ResponseEntity<byte[]> downloadReceipt(@PathVariable Long paymentId) {
        byte[] receiptContent = paymentService.generateReceipt(paymentId); // Service method to generate PDF/HTML
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF); // or APPLICATION_OCTET_STREAM, or TEXT_HTML
        headers.setContentDispositionFormData("attachment", "receipt_" + paymentId + ".pdf");
        return new ResponseEntity<>(receiptContent, headers, HttpStatus.OK);
    }
}