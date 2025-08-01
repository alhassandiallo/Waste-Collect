package com.wastecollect.backend.service;

import com.wastecollect.common.dto.*;
import com.wastecollect.common.models.*;
import com.wastecollect.common.utils.ServiceRequestStatus;
import com.wastecollect.common.utils.WasteType;
import com.wastecollect.backend.repository.HouseholdRepository;
import com.wastecollect.backend.repository.MunicipalityRepository;
import com.wastecollect.backend.repository.ServiceRequestRepository;
import com.wastecollect.backend.repository.PaymentRepository;
import com.wastecollect.backend.repository.CollectorRepository;
import com.wastecollect.backend.repository.RatingRepository;
import com.wastecollect.backend.exception.RequestValidationException;
import com.wastecollect.backend.exception.ResourceException;
import com.wastecollect.backend.exception.ResourceNotFoundException; // Import ResourceNotFoundException

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder; // For password encoding
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;
import java.time.LocalDateTime;
import java.util.Date; // For rating date

@Service
public class HouseholdService {

	private static final Logger logger = LoggerFactory.getLogger(HouseholdService.class);

	@Autowired
	private HouseholdRepository householdRepository;

	@Autowired
	private ServiceRequestRepository serviceRequestRepository;

	@Autowired
	private MunicipalityRepository municipalityRepository;

	@Autowired
	private PaymentRepository paymentRepository;

	@Autowired
	private CollectorRepository collectorRepository;

	@Autowired
	private RatingRepository collectorRatingRepository;

	@Autowired(required = false) // Make it optional if not always used (e.g., for testing without security)
	private PasswordEncoder passwordEncoder; // For hashing passwords

	// Helper method to get the current authenticated Household user
	private Optional<Household> getCurrentHousehold() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !authentication.isAuthenticated()) {
			logger.warn("No authenticated user found in security context.");
			return Optional.empty();
		}
		// Assuming your UserDetails implementation provides the User's email
		// Or you might have a custom principal that directly gives you the Household ID
		String username = ((UserDetails) authentication.getPrincipal()).getUsername();
		return householdRepository.findByEmail(username); // Assuming findByEmail exists in HouseholdRepository
	}

	/**
	 * Registers a new household.
	 * * @param creationDTO The DTO containing household registration details.
	 * @throws IllegalStateException if a household with the given email already
	 * exists.
	 */
	public void registerNewHousehold(HouseholdCreationDTO creationDTO) {
	    if (householdRepository.findByEmail(creationDTO.getEmail()).isPresent()) {
	        throw new IllegalStateException("Household with email " + creationDTO.getEmail() + " already exists.");
	    }

	    Household newHousehold = new Household();
	    // Map properties from DTO to entity
	    newHousehold.setFirstName(creationDTO.getFirstName());
	    newHousehold.setLastName(creationDTO.getLastName());
	    newHousehold.setEmail(creationDTO.getEmail());
	    // Encode password before saving
	    if (passwordEncoder != null) {
	        newHousehold.setPassword(passwordEncoder.encode(creationDTO.getPassword()));
	    } else {
	        logger.warn(
	                "PasswordEncoder is not configured. Saving password in plain text. THIS IS INSECURE IN PRODUCTION!");
	        newHousehold.setPassword(creationDTO.getPassword()); // Insecure for production
	    }
	    newHousehold.setPhoneNumber(creationDTO.getPhoneNumber());
	    newHousehold.setAddress(creationDTO.getAddress());
	    newHousehold.setNumberOfMembers(creationDTO.getNumberOfMembers());
	    newHousehold.setHousingType(creationDTO.getHousingType());

	    // --- CORRECTED LINE ---
	    // Retrieve the Municipality entity based on the area string
	    // You might need a method like findByAreaName or findByMunicipalityName in your MunicipalityRepository
	    Municipality municipality = municipalityRepository.findByMunicipalityName(creationDTO.getMunicipalityName()) // Assuming getArea() gives the municipality name
	            .orElseThrow(() -> new ResourceException("Municipality", "name", creationDTO.getMunicipalityName()));
	    newHousehold.setMunicipality(municipality); // Set the Municipality object

	    newHousehold.setLatitude(creationDTO.getLatitude());
	    newHousehold.setLongitude(creationDTO.getLongitude());
	    newHousehold.setCollectionPreferences("Default preferences"); // Set a default or leave null

	    householdRepository.save(newHousehold);
	    logger.info("New household registered with email: {}", creationDTO.getEmail());
	}

	/**
	 * Creates a new waste pickup request for the authenticated household.
	 * * @param request The DTO containing service request details.
	 * @throws HouseholdNotFoundException if the authenticated household is not
	 * found.
	 * @throws InvalidInputException      if the request data is invalid.
	 */
	public void createPickupRequest(ServiceRequestDTO request) {
		Household household = getCurrentHousehold()
				.orElseThrow(() -> new ResourceNotFoundException("Household not found.")); // Changed from ResourceException
		ServiceRequest newRequest = new ServiceRequest();
		newRequest.setHousehold(household); //
		newRequest.setWasteType(request.getWasteType()); //
		newRequest.setEstimatedVolume(request.getEstimatedVolume()); //
		newRequest.setPreferredDate(request.getPreferredDate()); //
		newRequest.setDescription(request.getDescription()); // // Added: Map description
		newRequest.setComment(request.getComment()); //
		newRequest.setAddress(request.getAddress()); // // Changed: Use address from DTO
		newRequest.setPhoneNumber(request.getPhone()); // // NEW: Map phone to new phoneNumber field in entity
		newRequest.setStatus(ServiceRequestStatus.PENDING); // Set initial status
		newRequest.setCreatedAt(LocalDateTime.now()); // Set creation timestamp
		newRequest.setUpdatedAt(LocalDateTime.now()); // Set update timestamp

		serviceRequestRepository.save(newRequest);
		// Assuming logger is configured:
		// logger.info("Pickup request created for household ID: {}",
		// household.getId());
	}

	/**
	 * Updates the collection preferences for the authenticated household.
	 * * @param preferences The DTO containing updated preferences.
	 * @throws HouseholdNotFoundException if the authenticated household is not
	 * found.
	 */
	public void updateCollectionPreferences(HouseholdUpdateDTO preferences) {
	    Household household = getCurrentHousehold()
	            .orElseThrow(() -> new ResourceNotFoundException("Household not found.")); // Changed from ResourceException

	    // Only update fields that are provided in the DTO (non-null)
	    if (preferences.getFirstName() != null)
	        household.setFirstName(preferences.getFirstName());
	    if (preferences.getLastName() != null)
	        household.setLastName(preferences.getLastName());
	    if (preferences.getPhoneNumber() != null)
	        household.setPhoneNumber(preferences.getPhoneNumber());
	    if (preferences.getAddress() != null)
	        household.setAddress(preferences.getAddress());
	    if (preferences.getNumberOfMembers() != null)
	        household.setNumberOfMembers(preferences.getNumberOfMembers());
	    if (preferences.getHousingType() != null)
	        household.setHousingType(preferences.getHousingType());

	    // --- FIX START ---
	    if (preferences.getArea() != null) {
	        // Assuming getArea() returns the name of the municipality
	        Municipality municipality = municipalityRepository.findByMunicipalityName(preferences.getArea())
	                .orElseThrow(() -> new ResourceNotFoundException("Municipality not found: " + preferences.getArea())); // Changed from ResourceException
	        household.setMunicipality(municipality);
	    }
	    // --- FIX END ---

	    if (preferences.getCollectionPreferences() != null)
	        household.setCollectionPreferences(preferences.getCollectionPreferences());
	    if (preferences.getLatitude() != null)
	        household.setLatitude(preferences.getLatitude());
	    if (preferences.getLongitude() != null)
	        household.setLongitude(preferences.getLongitude());

	    householdRepository.save(household);
	    logger.info("Collection preferences updated for household ID: {}", household.getId());
	}
	/**
	 * Processes a payment for the authenticated household.
	 * * @param payment The DTO containing payment details.
	 * @throws HouseholdNotFoundException if the authenticated household is not
	 * found.
	 */
	public void processPayment(PaymentDTO payment) {
		Household paymentHousehold = getCurrentHousehold().orElseThrow(
				() -> new ResourceNotFoundException("Household not found.")); // Changed from ResourceException

		Payment newPayment = new Payment(payment.getAmount(), payment.getPaymentMethod(), payment.getStatus(),
				payment.getPaymentDate(), payment.getTransactionReference(), paymentHousehold);
		paymentRepository.save(newPayment);
		logger.info("Payment processed for household ID: {} with amount: {}", paymentHousehold.getId(),
				payment.getAmount());
	}

	// Removed the overloaded processPayment(PaymentDTO payment, ServiceRequest
	// serviceRequest)
	// as it was noted as potentially redundant and can be integrated into the main
	// method
	// or handled by adding serviceRequestId to PaymentDTO if all payments are
	// linked.

	/**
	 * Records a collector rating from the authenticated household.
	 * * @param ratingDto The DTO containing rating details.
	 * @throws HouseholdNotFoundException if the authenticated household is not
	 * found.
	 * @throws InvalidInputException      if the collector or service request is not
	 * found.
	 * @throws SecurityException          if the service request does not belong to
	 * the current household.
	 */
	public void rateCollector(CollectorRatingDTO ratingDto) {
		Household household = getCurrentHousehold()
				.orElseThrow(() -> new ResourceNotFoundException("Household not found.")); // Changed from ResourceException

		Collector collector = collectorRepository.findById(ratingDto.getCollectorId()).orElseThrow(
				() -> new ResourceNotFoundException("Collector not found with ID: " + ratingDto.getCollectorId())); // Changed from ResourceException

        ServiceRequest serviceRequest = serviceRequestRepository.findById(ratingDto.getServiceRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Service Request not found with ID: " + ratingDto.getServiceRequestId())); // Changed from ResourceException

		// Security check: Ensure the service request belongs to the current household
		if (!serviceRequest.getHousehold().getId().equals(household.getId())) {
			throw new SecurityException("Unauthorized: Service request does not belong to the current household.");
		}

		// Fix 3: Use findByServiceRequest and check if the list is empty
		if (!collectorRatingRepository.findByServiceRequest(serviceRequest).isEmpty()) {
		    throw new RequestValidationException("A rating for this service request already exists.");
		}

		CollectorRating newRating = new CollectorRating(collector, household, serviceRequest,
				ratingDto.getRatingValue(), ratingDto.getComment(), new Date() // Current date
		);

		collectorRatingRepository.save(newRating);
		logger.info("Collector rating recorded for collector ID: {} by household ID: {} for service request ID: {}",
				collector.getId(), household.getId(), serviceRequest.getId());

		// Optional: Update average rating for the collector (e.g., as part of Collector
		// entity)
		// This would involve fetching all ratings for the collector, recalculating
		// average, and saving.
	}

	/**
     * Placeholder for waste generation patterns.
     * In a real application, this would fetch data from a database or perform calculations.
     * @return A dummy WastePatternDTO.
     */
	
	public WastePatternDTO getWasteGenerationPatterns() {
        // This is a placeholder. Implement actual logic to retrieve waste patterns.
        // For example, aggregate data from ServiceRequests or WasteCollections.

        logger.info("Generating dummy waste generation patterns.");

        // Corrected: Using the 5-argument constructor of WastePatternDTO
        // You need to provide values for all parameters:
        // WasteType wasteType, Double averageVolume, LocalDate startDate, LocalDate endDate, Integer frequencyDays
        return new WastePatternDTO(
                WasteType.GENERAL, // Placeholder: Assuming 'GENERAL' is a valid WasteType
                150.0,             // monthlyAverageVolume
                LocalDateTime.now().minusMonths(3), // Placeholder: Start date 3 months ago
                LocalDateTime.now(),                // Placeholder: End date as today
                30                              // Placeholder: Frequency in days (e.g., monthly)
        );
    }

}
