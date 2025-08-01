package com.wastecollect.backend.controller;

import com.wastecollect.common.dto.*;
import com.wastecollect.backend.service.HouseholdService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid; // Import for @Valid
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@RestController
@RequestMapping("/api/v1/household")
@CrossOrigin(origins = "http://localhost:3000") // Configure this securely for production
public class HouseholdController {

    private static final Logger logger = LoggerFactory.getLogger(HouseholdController.class);

    @Autowired
    private HouseholdService householdService;

    // Endpoint for household registration (example, assuming you add this functionality)
    @PostMapping("/register")
    public ResponseEntity<String> registerHousehold(@Valid @RequestBody HouseholdCreationDTO householdCreationDTO) {
        logger.info("Received registration request for email: {}", householdCreationDTO.getEmail());
        // Removed specific try-catch for HouseholdNotFoundException/InvalidInputException
        // These are now handled by GlobalExceptionHandler based on exceptions thrown by service.
        try {
            householdService.registerNewHousehold(householdCreationDTO);
            logger.info("Household registered successfully for email: {}", householdCreationDTO.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body("Household registered successfully");
        } catch (IllegalStateException e) { // Keep this specific catch if it's a business-level conflict
            logger.error("Registration failed for email {}: {}", householdCreationDTO.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage()); // e.g., email already exists
        } catch (Exception e) { // Generic catch for unexpected errors
            logger.error("An unexpected error occurred during registration for email {}: {}", householdCreationDTO.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred during registration.");
        }
    }

    // Waste pickup request
    @PostMapping("/request-pickup")
    public ResponseEntity<String> requestWastePickup(@Valid @RequestBody ServiceRequestDTO request) {
        logger.info("Received waste pickup request from household.");
        // Removed specific try-catch for HouseholdNotFoundException/InvalidInputException
        // These are now handled by GlobalExceptionHandler based on exceptions thrown by service.
        try {
            householdService.createPickupRequest(request);
            logger.info("Waste pickup request created successfully.");
            return ResponseEntity.ok("Waste pickup request created successfully");
        } catch (Exception e) { // Generic catch for unexpected errors
            logger.error("An unexpected error occurred during waste pickup request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }

    // Collector rating - Corrected to use CollectorRatingDTO and added @Valid
    @PostMapping("/rate-collector")
    public ResponseEntity<String> rateCollector(@Valid @RequestBody CollectorRatingDTO ratingDto) {
        logger.info("Received collector rating request for service request ID: {}", ratingDto.getServiceRequestId());
        // Removed specific try-catch for HouseholdNotFoundException/InvalidInputException/SecurityException
        // These are now handled by GlobalExceptionHandler based on exceptions thrown by service.
        try {
            householdService.rateCollector(ratingDto);
            logger.info("Rating recorded successfully for service request ID: {}", ratingDto.getServiceRequestId());
            return ResponseEntity.ok("Rating recorded successfully");
        } catch (Exception e) { // Generic catch for unexpected errors
            logger.error("An unexpected error occurred during collector rating: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }

    // Waste generation patterns
    @GetMapping("/waste-patterns")
    public ResponseEntity<WastePatternDTO> getWastePatterns() {
        logger.info("Fetching waste generation patterns.");
        // Removed specific try-catch for HouseholdNotFoundException
        // This is now handled by GlobalExceptionHandler based on exceptions thrown by service.
        try {
            WastePatternDTO wastePatterns = householdService.getWasteGenerationPatterns();
            return ResponseEntity.ok(wastePatterns);
        } catch (Exception e) { // Generic catch for unexpected errors
            logger.error("An unexpected error occurred while fetching waste patterns: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Collection preferences - Now uses HouseholdUpdateDTO and added @Valid
    @PutMapping("/collection-preferences")
    public ResponseEntity<String> updateCollectionPreferences(@Valid @RequestBody HouseholdUpdateDTO preferences) {
        logger.info("Received request to update collection preferences.");
        // Removed specific try-catch for HouseholdNotFoundException/InvalidInputException
        // These are now handled by GlobalExceptionHandler based on exceptions thrown by service.
        try {
            householdService.updateCollectionPreferences(preferences);
            logger.info("Collection preferences updated successfully.");
            return ResponseEntity.ok("Preferences updated successfully");
        } catch (Exception e) { // Generic catch for unexpected errors
            logger.error("An unexpected error occurred during collection preferences update: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }

    // Digital payments
    @PostMapping("/make-payment")
    public ResponseEntity<String> makePayment(@Valid @RequestBody PaymentDTO payment) {
        logger.info("Received payment request for amount: {}", payment.getAmount());
        // Removed specific try-catch for HouseholdNotFoundException/InvalidInputException
        // These are now handled by GlobalExceptionHandler based on exceptions thrown by service.
        try {
            householdService.processPayment(payment);
            logger.info("Payment completed successfully for amount: {}", payment.getAmount());
            return ResponseEntity.ok("Payment completed successfully");
        } catch (Exception e) { // Generic catch for unexpected errors
            logger.error("An unexpected error occurred during payment processing: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }
}