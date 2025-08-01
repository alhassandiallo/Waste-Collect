// File: com/wastecollect/backend/service/AdminService.java
package com.wastecollect.backend.service;

import com.wastecollect.common.dto.*; // Import all DTOs from the common package
import com.wastecollect.backend.service.report.FileStorageService;
import com.wastecollect.backend.service.report.MapDataService;
import com.wastecollect.backend.service.report.PredictiveAnalysisService;
import com.wastecollect.backend.service.report.ReportGenerationService;
import com.wastecollect.backend.exception.ResourceException;
import com.wastecollect.backend.exception.ResourceNotFoundException;
import com.wastecollect.common.models.*;
import com.wastecollect.common.utils.CollectorStatus;
import com.wastecollect.common.utils.DisputeStatus;
import com.wastecollect.common.utils.NotificationType;
import com.wastecollect.common.utils.RoleName;
import com.wastecollect.common.utils.ServiceRequestStatus;
import com.wastecollect.common.utils.WasteType;

import jakarta.persistence.criteria.Predicate;

import com.wastecollect.common.utils.HousingType; // Import HousingType
import com.wastecollect.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

// NEW Import
import com.wastecollect.common.dto.notification.CreateNotificationRequest;
import com.wastecollect.common.dto.report.ReportConfigDTO;
import com.wastecollect.common.dto.report.ReportDTO;
import com.wastecollect.common.dto.report.ReportMapper;

@Service
public class AdminService {

    private static final Logger logger = LoggerFactory.getLogger(AdminService.class);

    // Repositories - Ensure these are final and injected via constructor
    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final CollectorRepository collectorRepository;
    private final RoleRepository roleRepository;
    private final HouseholdRepository householdRepository;
    private final MunicipalityRepository municipalityRepository;
    private final MunicipalManagerRepository municipalManagerRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final NotificationRepository notificationRepository;
    private final PaymentRepository paymentRepository;
    private final DisputeRepository disputeRepository;
    private final WasteCollectionRepository wasteCollectionRepository;
    private final ReportRepository reportRepository;
    private final NotificationService notificationService; // NEW: Inject NotificationService

    // Helper Services
    private final ReportGenerationService reportGenerationService;
    private final MapDataService mapDataService;
    private final PredictiveAnalysisService predictiveAnalysisService;
    private final FileStorageService fileStorageService;


    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    public AdminService(UserRepository userRepository, AdminRepository adminRepository, CollectorRepository collectorRepository,
                        RoleRepository roleRepository, HouseholdRepository householdRepository,
                        MunicipalityRepository municipalityRepository, MunicipalManagerRepository municipalManagerRepository,
                        ServiceRequestRepository serviceRequestRepository, NotificationRepository notificationRepository,
                        PaymentRepository paymentRepository, DisputeRepository disputeRepository,
                        WasteCollectionRepository wasteCollectionRepository, ReportRepository reportRepository,
                        NotificationService notificationService, // NEW: Add to constructor
                        ReportGenerationService reportGenerationService, MapDataService mapDataService, PredictiveAnalysisService predictiveAnalysisService, FileStorageService fileStorageService) {
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
        this.collectorRepository = collectorRepository;
        this.roleRepository = roleRepository;
        this.householdRepository = householdRepository;
        this.municipalityRepository = municipalityRepository;
        this.municipalManagerRepository = municipalManagerRepository;
        this.serviceRequestRepository = serviceRequestRepository;
        this.notificationRepository = notificationRepository;
        this.paymentRepository = paymentRepository;
        this.disputeRepository = disputeRepository;
        this.wasteCollectionRepository = wasteCollectionRepository;
        this.reportRepository = reportRepository;
        this.notificationService = notificationService; // NEW: Assign
        this.reportGenerationService = reportGenerationService;
        this.mapDataService = mapDataService;
        this.predictiveAnalysisService = predictiveAnalysisService;
        this.fileStorageService = fileStorageService;
    }

    /**
     * Retrieves all users with optional filters and pagination.
     * This method is designed to be flexible for various user listing needs within the admin context.
     * For specific roles, a 'role' filter can be applied.
     *
     * @param filters Map of filters (e.g., 'role', 'search').
     * @param pageable Pageable object for pagination.
     * @return A paginated list of UserDTOs.
     */
    @Transactional(readOnly = true)
    public Page<UserDTO> getAllUsers(Map<String, String> filters, Pageable pageable) {
        String roleName = filters.get("role");
        String searchTerm = filters.get("search"); // Example: if you add search functionality
        Page<User> usersPage;

        if (roleName != null && !roleName.isEmpty()) {
            try {
                Role role = roleRepository.findByName(RoleName.valueOf(roleName))
                        .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
                usersPage = userRepository.findByRolesContaining(role, pageable);
            } catch (IllegalArgumentException e) {
                throw new ResourceException("Role", "name", roleName, "Invalid role name provided.");
            }
        } else if (searchTerm != null && !searchTerm.isEmpty()) {
            // Example: search by firstName, lastName, email
            usersPage = userRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                    searchTerm, searchTerm, searchTerm, pageable);
        } else {
            usersPage = userRepository.findAll(pageable);
        }

        // Convert User entities to UserDTOs
        return usersPage.map(this::convertToUserDTO);
    }

    // --- Admin Profile Management ---

    @Transactional(readOnly = true)
    public AdminProfileDTO getAdminProfile(Long adminId) {
        logger.info("Fetching admin profile for ID: {}", adminId);
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with ID: " + adminId));
        return convertToAdminProfileDTO(admin);
    }
    
    @Transactional
    public AdminProfileDTO updateAdminProfile(Long adminId, AdminUpdateDTO dto) { // Changed DTO to AdminUpdateDTO
        logger.info("Updating admin profile for ID: {}", adminId);
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with ID: " + adminId));

        // Update common User fields
        admin.setFirstName(dto.getFirstName());
        admin.setLastName(dto.getLastName());
        admin.setEmail(dto.getEmail());
        admin.setPhoneNumber(dto.getPhoneNumber());
        admin.setAddress(dto.getAddress());

        // Update Admin-specific fields
        admin.setPosition(dto.getPosition());
        admin.setManagementArea(dto.getManagementArea());

        Admin updatedAdmin = adminRepository.save(admin);
        return convertToAdminProfileDTO(updatedAdmin);
    }

    @Transactional
    public void deleteAdmin(Long adminId) {
        logger.info("Deleting admin with ID: {}", adminId);
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with ID: " + adminId));

        // Delete the Admin entity. Due to inheritance, this will also delete the corresponding User record.
        adminRepository.delete(admin);
        logger.info("Admin with ID: {} deleted successfully.", adminId);
    }

	/*
	 * @Transactional public AdminProfileDTO updateAdminProfile(Long adminId,
	 * UserUpdateDTO dto) { logger.info("Updating admin profile for ID: {}",
	 * adminId); Admin admin = adminRepository.findById(adminId) .orElseThrow(() ->
	 * new ResourceNotFoundException("Admin not found with ID: " + adminId));
	 * 
	 * admin.setFirstName(dto.getFirstName()); admin.setLastName(dto.getLastName());
	 * admin.setEmail(dto.getEmail()); admin.setPhoneNumber(dto.getPhoneNumber());
	 * admin.setAddress(dto.getAddress()); // No password update here, as it's a
	 * separate concern.
	 * 
	 * Admin updatedAdmin = adminRepository.save(admin); return
	 * convertToAdminProfileDTO(updatedAdmin); }
	 */

    // Helper method to convert Admin to AdminProfileDTO
    private AdminProfileDTO convertToAdminProfileDTO(Admin admin) {
        AdminProfileDTO dto = new AdminProfileDTO();
        dto.setId(admin.getId());
        dto.setFirstName(admin.getFirstName());
        dto.setLastName(admin.getLastName());
        dto.setEmail(admin.getEmail());
        dto.setPhoneNumber(admin.getPhoneNumber());
        dto.setAddress(admin.getAddress());
        // Set the role name from the User's roles
        if (admin.getRoles() != null && !admin.getRoles().isEmpty()) {
            Optional<Role> adminRole = admin.getRoles().stream()
                    .filter(role -> role.getName() == RoleName.ADMIN)
                    .findFirst();
            adminRole.ifPresent(role -> dto.setRoleName(role.getName()));
        }
        return dto;
    }

    // Helper method to convert User to UserDTO (general purpose)
    private UserDTO convertToUserDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setAddress(user.getAddress());
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            // Get the primary role name for the DTO
            dto.setRoleName(user.getRoles().iterator().next().getName());
        }
        return dto;
    }

    // --- Municipality Management ---
    @Transactional
    public void createMunicipality(MunicipalityCreationDTO dto) {
        logger.info("Attempting to create new municipality: {}", dto.getMunicipalityName());

        // 1. Check if email already exists for the manager
        if (userRepository.existsByEmail(dto.getManagerEmail())) {
            throw new ResourceException("User", "email", dto.getManagerEmail(), "already registered");
        }

        // 2. Create the new municipality
        Municipality municipality = new Municipality();
        municipality.setMunicipalityName(dto.getMunicipalityName());
        municipality.setProvince(dto.getProvince());
        municipality.setCountry(dto.getCountry());
        municipality.setPopulation(dto.getPopulation());
        municipality.setWasteManagementBudget(dto.getWasteManagementBudget());
        municipality.setEnabled(true); // Municipalities are enabled by default
        Municipality savedMunicipality = municipalityRepository.save(municipality); // Save to get ID
        logger.info("Municipality saved with ID: {}", savedMunicipality.getId());

        // 3. Create the MunicipalManager instance directly (it extends User)
        MunicipalManager municipalManager = new MunicipalManager();
        municipalManager.setFirstName(dto.getManagerFirstName());
        municipalManager.setLastName(dto.getManagerLastName());
        municipalManager.setEmail(dto.getManagerEmail());
        municipalManager.setPassword(passwordEncoder.encode(dto.getManagerPassword()));
        municipalManager.setPhoneNumber(dto.getManagerPhoneNumber());
        municipalManager.setAddress(dto.getManagerAddress());
        municipalManager.setEnabled(true); // Manager is active by default
        municipalManager.setAccountNonExpired(true); // Set these properties as they are part of User
        municipalManager.setAccountNonLocked(true);
        municipalManager.setCredentialsNonExpired(true);

        // Assign MUNICIPAL_MANAGER role
        Role managerRole = roleRepository.findByName(RoleName.MUNICIPAL_MANAGER)
                .orElseThrow(() -> new ResourceException("Role", "name", RoleName.MUNICIPAL_MANAGER.name(), "not found"));
        Set<Role> roles = new HashSet<>();
        roles.add(managerRole);
        municipalManager.setRoles(roles);

        // Link manager to the newly created municipality
        municipalManager.setMunicipality(savedMunicipality);

        // 4. Save MunicipalManager directly. Hibernate will handle the User part due to inheritance.
        municipalManagerRepository.save(municipalManager);
        logger.info("Municipal Manager profile created for email {} linked to municipality {}.",
                dto.getManagerEmail(), savedMunicipality.getMunicipalityName());

        logger.info("Municipality '{}' and its initial manager '{} {}' created successfully.",
                dto.getMunicipalityName(), dto.getManagerFirstName(), dto.getManagerLastName());
    }

    @Transactional
    public MunicipalityDTO updateMunicipality(Long id, MunicipalityDTO dto) {
        Municipality municipality = municipalityRepository.findById(id)
                .orElseThrow(() -> new ResourceException("Municipality", String.valueOf(id)));

        municipality.setMunicipalityName(dto.getMunicipalityName());
        municipality.setProvince(dto.getProvince());
        municipality.setCountry(dto.getCountry());
        municipality.setPopulation(dto.getPopulation());
        municipality.setWasteManagementBudget(dto.getWasteManagementBudget());
        municipality.setEnabled(dto.getEnabled());

        // Update the associated Municipal Manager if provided in the DTO
        if (dto.getManager() != null) {
            MunicipalManagerProfileDTO managerDto = dto.getManager();

            // Find the current manager associated with this municipality.
            // Assuming one manager per municipality for simplicity.
            // If the manager ID is present in the DTO, use it to find the manager directly.
            // Otherwise, try to find by municipality association.
            Optional<MunicipalManager> optionalExistingManager;
            if (managerDto.getId() != null) {
                optionalExistingManager = municipalManagerRepository.findById(managerDto.getId());
            } else {
                optionalExistingManager = municipalManagerRepository.findByMunicipality(municipality);
            }

            optionalExistingManager.ifPresent(existingManager -> {
                // Fetch the User portion of the MunicipalManager to update common fields
                User managerUser = userRepository.findById(existingManager.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found for Municipal Manager with ID: " + existingManager.getId()));

                // Update manager's user details
                managerUser.setFirstName(managerDto.getFirstName());
                managerUser.setLastName(managerDto.getLastName());

                // Only update email if it's different and not already taken by another user
                if (!managerUser.getEmail().equals(managerDto.getEmail()) && userRepository.existsByEmail(managerDto.getEmail())) {
                     throw new ResourceException("User", "email", managerDto.getEmail(), "already registered by another user.");
                }
                managerUser.setEmail(managerDto.getEmail());

                managerUser.setPhoneNumber(managerDto.getPhoneNumber());
                managerUser.setAddress(managerDto.getAddress());
                //managerUser.setEnabled(managerDto.getEnabled()); // Use the enabled status from the DTO

                userRepository.save(managerUser); // Save the updated user (which also updates MunicipalManager implicitly due to inheritance)
                logger.info("Updated municipal manager with ID {} for municipality {}.", existingManager.getId(), municipality.getMunicipalityName());
            });
            // If the managerDto is provided but no existing manager is found,
            // you might want to log a warning or throw an error depending on business logic.
            // For this request, we'll proceed if no manager update is performed.
        }

        Municipality updatedMunicipality = municipalityRepository.save(municipality);
        logger.info("Municipality with ID {} updated successfully.", id);
        return convertToMunicipalityDTO(updatedMunicipality);
    }

    /**
     * Retrieves all municipalities with optional filters and pagination.
     *
     * @param searchTerm Optional search term for municipality name.
     * @param filterProvince Optional filter for province.
     * @param pageable Pageable object for pagination.
     * @return A paginated list of MunicipalityDTOs.
     */
    @Transactional(readOnly = true)
    public Page<MunicipalityDTO> getAllMunicipalities(String searchTerm, String filterProvince, Pageable pageable) {
        logger.info("Fetching all municipalities with pagination: {} and filters: search={}, province={}", pageable, searchTerm, filterProvince);
        Page<Municipality> municipalitiesPage;

        if (searchTerm != null && !searchTerm.isEmpty() && filterProvince != null && !filterProvince.isEmpty()) {
            municipalitiesPage = municipalityRepository.findByMunicipalityNameContainingIgnoreCaseAndProvinceContainingIgnoreCase(searchTerm, filterProvince, pageable);
        } else if (searchTerm != null && !searchTerm.isEmpty()) {
            municipalitiesPage = municipalityRepository.findByMunicipalityNameContainingIgnoreCase(searchTerm, pageable);
        } else if (filterProvince != null && !filterProvince.isEmpty()) {
            municipalitiesPage = municipalityRepository.findByProvinceContainingIgnoreCase(filterProvince, pageable);
        } else {
            municipalitiesPage = municipalityRepository.findAll(pageable);
        }

        return municipalitiesPage.map(this::convertToMunicipalityDTO);
    }

    @Transactional
    public void deleteMunicipality(Long id) {
        Municipality municipality = municipalityRepository.findById(id)
                .orElseThrow(() -> new ResourceException("Municipalité non trouvée avec l'ID: " + id, null));

        // Before deleting the municipality, explicitly delete its associated municipal manager(s)
        municipalManagerRepository.findByMunicipality(municipality).ifPresent(manager -> {
            userRepository.delete(manager); // Delete the manager from the User table (as MunicipalManager extends User)
            logger.info("Deleted associated municipal manager with ID: {}", manager.getId());
        });

        municipalityRepository.delete(municipality);
        logger.info("Municipality deleted with ID: {}", id);
    }

    @Transactional(readOnly = true)
    public MunicipalityDTO getMunicipalityById(Long id) {
        Municipality municipality = municipalityRepository.findById(id)
            .orElseThrow(() -> new ResourceException("Municipality", String.valueOf(id)));
        return convertToMunicipalityDTO(municipality); // Use the helper method
    }

    @Transactional
    public MunicipalManagerProfileDTO createMunicipalManagerForExistingMunicipality(MunicipalManagerCreationDTO creationDTO) {
        if (userRepository.existsByEmail(creationDTO.getEmail())) {
            throw new ResourceException("User", "email", creationDTO.getEmail(), "already registered");
        }

        Municipality municipality = municipalityRepository.findById(creationDTO.getMunicipalityId())
            .orElseThrow(() -> new ResourceException("Municipality", String.valueOf(creationDTO.getMunicipalityId()), "not found"));

        MunicipalManager municipalManager = new MunicipalManager();
        municipalManager.setFirstName(creationDTO.getFirstName());
        municipalManager.setLastName(creationDTO.getLastName());
        municipalManager.setEmail(creationDTO.getEmail());
        municipalManager.setPassword(passwordEncoder.encode(creationDTO.getPassword()));
        municipalManager.setPhoneNumber(creationDTO.getPhoneNumber());
        municipalManager.setAddress(creationDTO.getAddress());
        municipalManager.setEnabled(true);
        municipalManager.setAccountNonExpired(true);
        municipalManager.setAccountNonLocked(true);
        municipalManager.setCredentialsNonExpired(true);


        Role managerRole = roleRepository.findByName(RoleName.MUNICIPAL_MANAGER)
            .orElseThrow(() -> new ResourceException("Role", "name", RoleName.MUNICIPAL_MANAGER.name(), "not found"));
        Set<Role> roles = new HashSet<>();
        roles.add(managerRole);
        municipalManager.setRoles(roles);
        municipalManager.setMunicipality(municipality);
        municipalManagerRepository.save(municipalManager); // Directly save the MunicipalManager

        logger.info("Municipal manager '{} {}' created for municipality '{}'.",
            creationDTO.getFirstName(), creationDTO.getLastName(), municipality.getMunicipalityName());

        // After saving, the manager object will have its ID generated by JPA
        // Fetch the user part explicitly for the DTO conversion if necessary, though direct mapping might suffice
        User savedManagerUser = userRepository.findById(municipalManager.getId())
            .orElseThrow(() -> new ResourceException("User", String.valueOf(municipalManager.getId()), "not found after creation"));

        return convertToMunicipalManagerProfileDTO(municipalManager, savedManagerUser);
    }

    private MunicipalityDTO convertToMunicipalityDTO(Municipality municipality) {
        MunicipalityDTO dto = new MunicipalityDTO();
        dto.setId(municipality.getId());
        dto.setMunicipalityName(municipality.getMunicipalityName());
        dto.setProvince(municipality.getProvince());
        dto.setCountry(municipality.getCountry());
        dto.setPopulation(municipality.getPopulation());
        dto.setWasteManagementBudget(municipality.getWasteManagementBudget());
        dto.setEnabled(municipality.isEnabled());


        logger.info("Converting municipality to DTO: {}", municipality.getMunicipalityName());

        Optional<MunicipalManager> optionalManager = municipalManagerRepository.findByMunicipality(municipality);

        if (optionalManager.isPresent()) {
            MunicipalManager manager = optionalManager.get();
            logger.info("Found municipal manager for municipality {}: ID {}", municipality.getMunicipalityName(), manager.getId());

            // Now, find the associated User details for this MunicipalManager
            // This is crucial because basic user info (name, email) is on the User entity.
            Optional<User> optionalManagerUser = userRepository.findById(manager.getId());

            if (optionalManagerUser.isPresent()) {
                User managerUser = optionalManagerUser.get();
                logger.info("Found user details for manager ID {}: {} {}", manager.getId(), managerUser.getFirstName(), managerUser.getLastName());

                // Convert to MunicipalManagerProfileDTO and set in MunicipalityDTO
                // The signature of convertToMunicipalManagerProfileDTO is now fixed to (MunicipalManager, User)
                dto.setManager(convertToMunicipalManagerProfileDTO(manager, managerUser));
                logger.info("Manager DTO set for municipality {}. Manager email: {}", municipality.getMunicipalityName(), dto.getManager().getEmail());
            } else {
                logger.warn("No User details found for MunicipalManager with ID: {}", manager.getId());
                // Optionally set manager to null or a placeholder DTO indicating no user found
                dto.setManager(null);
            }
        } else {
            logger.info("No municipal manager found for municipality: {}", municipality.getMunicipalityName());
            dto.setManager(null); // Explicitly ensure manager is null if not found
        }

        return dto;
    }

    // CORRECTED: Changed the first parameter type from 'Role' to 'MunicipalManager'
    private MunicipalManagerProfileDTO convertToMunicipalManagerProfileDTO(MunicipalManager manager, User user) {
        MunicipalManagerProfileDTO dto = new MunicipalManagerProfileDTO();
        if (user != null) {
            dto.setId(user.getId());
            dto.setFirstName(user.getFirstName());
            dto.setLastName(user.getLastName());
            dto.setEmail(user.getEmail());
            dto.setPhoneNumber(user.getPhoneNumber());
            dto.setAddress(user.getAddress());
            dto.setRoleName(RoleName.MUNICIPAL_MANAGER); // Explicitly set role for clarity
        }
        // Ensure manager object and its municipality are not null before accessing them
        if (manager != null && manager.getMunicipality() != null) {
            dto.setMunicipalityId(manager.getMunicipality().getId());
            dto.setMunicipalityName(manager.getMunicipality().getMunicipalityName());
        }
        return dto;
    }


    // --- Collector Management ---
    @Transactional
    public void createCollector(CollectorCreationDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new ResourceException("User", "email", dto.getEmail(), "already registered");
        }

        Municipality municipality = municipalityRepository.findByMunicipalityName(dto.getMunicipalityName())
                .orElseThrow(() -> new ResourceException("Municipality", "name", dto.getMunicipalityName(), "not found"));

        // 1. Create a Collector instance (which extends User)
        Collector collector = new Collector();
        // 2. Set all common user properties
        collector.setFirstName(dto.getFirstName());
        collector.setLastName(dto.getLastName());
        collector.setEmail(dto.getEmail());
        collector.setPassword(passwordEncoder.encode(dto.getPassword())); // Use newPassword as per current DTO structure
        collector.setPhoneNumber(dto.getPhoneNumber());
        collector.setAddress(dto.getAddress());
        collector.setEnabled(true);
        collector.setAccountNonExpired(true);
        collector.setAccountNonLocked(true);
        collector.setCredentialsNonExpired(true);

        // 3. Assign COLLECTOR role
        Role collectorRole = roleRepository.findByName(RoleName.COLLECTOR)
                .orElseThrow(() -> new ResourceException("Role", "name", RoleName.COLLECTOR.name(), "not found"));
        Set<Role> roles = new HashSet<>();
        roles.add(collectorRole);
        collector.setRoles(roles);

        // 4. Set collector-specific properties
        collector.setStatus(dto.getStatus());
        collector.setMunicipality(municipality);

        // 5. Save the collector. This will persist the User part and Collector-specific fields.
        // The 'id' will be generated here.
        collectorRepository.save(collector);

        // 6. Now that the 'id' is generated, use it to create the human-readable collectorId
        String shortCollectorId = String.format("CO-%05d", collector.getId()); // CO-00001, CO-00010, etc.
        collector.setCollectorId(shortCollectorId);

        // 7. Save again to update the collector with the newly generated human-readable ID
        collectorRepository.save(collector);
        
        logger.info("Collector '{} {}' created successfully with ID: {}. Short ID: {}", dto.getFirstName(), dto.getLastName(),
                collector.getId(), shortCollectorId);
    }

    @Transactional
    public CollectorProfileDTO updateCollector(Long id, CollectorUpdateDTO dto) {
        Collector collector = collectorRepository.findById(id)
                .orElseThrow(() -> new ResourceException("Collector", String.valueOf(id)));

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceException("User", String.valueOf(id), "not found for collector"));

        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setAddress(dto.getAddress());
        user.setEnabled(dto.getStatus() == CollectorStatus.ACTIVE); // Sync user enabled status with collector status
        userRepository.save(user);

        collector.setStatus(dto.getStatus());
        collectorRepository.save(collector);
        logger.info("Collector with ID {} updated successfully.", id);
        return convertToCollectorProfileDTO(collector, user);
    }

    /**
     * Retrieves all collectors with optional filters and pagination.
     * @param searchTerm Optional search term for collector first name, last name, or email.
     * @param filterStatus Optional filter for collector status.
     * @param filterMunicipality Optional filter for municipality name.
     * @param pageable Pageable object for pagination.
     * @return A paginated list of CollectorProfileDTOs.
     */
    @Transactional(readOnly = true)
    public Page<CollectorProfileDTO> getAllCollectors(String searchTerm, String filterStatus, String filterMunicipality, Pageable pageable) {
        logger.info("Fetching all collectors with pagination: {} and filters: search={}, status={}, municipality={}", pageable, searchTerm, filterStatus, filterMunicipality);
        
        boolean hasSearchTerm = searchTerm != null && !searchTerm.isEmpty();
        boolean hasStatusFilter = filterStatus != null && !filterStatus.isEmpty();
        boolean hasMunicipalityFilter = filterMunicipality != null && !filterMunicipality.isEmpty();

        Municipality municipality = null;
        if (hasMunicipalityFilter) {
            municipality = municipalityRepository.findByMunicipalityName(filterMunicipality)
                .orElse(null); 
            if (municipality == null) {
                // If municipality is not found, no collectors will match this filter, return empty page.
                return new PageImpl<>(Collections.emptyList(), pageable, 0);
            }
        }

        CollectorStatus status = null;
        if (hasStatusFilter) {
            try {
                status = CollectorStatus.valueOf(filterStatus.toUpperCase());
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid CollectorStatus filter: {}", filterStatus);
                // Return empty page for invalid status filter.
                return new PageImpl<>(Collections.emptyList(), pageable, 0);
            }
        }

        List<Collector> filteredCollectors = new ArrayList<>();
        List<Collector> allCollectors = collectorRepository.findAll(); // Fetch all for in-memory filtering

        // Manual filtering based on all conditions
        for (Collector collector : allCollectors) {
            User user = userRepository.findById(collector.getId()).orElse(null);
            if (user == null) {
                continue; // Skip if user details are missing (should not happen normally)
            }

            boolean matchesSearch = true;
            if (hasSearchTerm) {
                String searchLower = searchTerm.toLowerCase();
                if (!user.getFirstName().toLowerCase().contains(searchLower) &&
                    !user.getLastName().toLowerCase().contains(searchLower) &&
                    !user.getEmail().toLowerCase().contains(searchLower)) {
                    matchesSearch = false;
                }
            }

            boolean matchesStatus = true;
            if (hasStatusFilter && collector.getStatus() != status) {
                matchesStatus = false;
            }

            boolean matchesMunicipality = true;
            if (hasMunicipalityFilter) {
                if (collector.getMunicipality() == null || !collector.getMunicipality().equals(municipality)) {
                    matchesMunicipality = false;
                }
            }

            if (matchesSearch && matchesStatus && matchesMunicipality) {
                filteredCollectors.add(collector);
            }
        }

        // Apply pagination manually
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filteredCollectors.size());
        
        List<CollectorProfileDTO> dtos = filteredCollectors.subList(start, end).stream()
            .map(collector -> {
                User user = userRepository.findById(collector.getId()).orElse(null);
                return convertToCollectorProfileDTO(collector, user);
            })
            .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, filteredCollectors.size());
    }

    @Transactional
    public void deleteCollector(Long id) {
        if (!collectorRepository.existsById(id)) {
            throw new ResourceException("Collector", String.valueOf(id));
        }
        collectorRepository.deleteById(id);
        userRepository.deleteById(id);
        logger.info("Collector and associated user with ID {} deleted successfully.", id);
    }

    @Transactional
    public void toggleCollectorStatus(Long id, Boolean isActive) {
        Collector collector = collectorRepository.findById(id)
            .orElseThrow(() -> new ResourceException("Collector", String.valueOf(id)));
        User user = userRepository.findById(id) // Fetch User part to update enabled status
            .orElseThrow(() -> new ResourceException("User", String.valueOf(id), "not found for collector"));

        collector.setStatus(isActive ? CollectorStatus.ACTIVE : CollectorStatus.INACTIVE);
        user.setEnabled(isActive);

        collectorRepository.save(collector);
        userRepository.save(user);
        logger.info("Collector with ID {} status toggled to {}.", id, isActive ? "ACTIVE" : "INACTIVE");
    }

    private CollectorProfileDTO convertToCollectorProfileDTO(Collector collector, User user) {
        CollectorProfileDTO dto = new CollectorProfileDTO();
        dto.setId(collector.getId());
        // Use the new short collectorId here
        dto.setCollectorId(collector.getCollectorId());
        dto.setStatus(collector.getStatus());
        if (user != null) {
            dto.setFirstName(user.getFirstName());
            dto.setLastName(user.getLastName());
            dto.setEmail(user.getEmail());
            dto.setPhoneNumber(user.getPhoneNumber());
            dto.setAddress(user.getAddress());
            if (collector.getMunicipality() != null) {
                dto.setMunicipalityName(collector.getMunicipality().getMunicipalityName());
            }
        }
        return dto;
    }

    // --- Household Management ---
    @Transactional
    public void createHousehold(HouseholdCreationDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new ResourceException("User", "email", dto.getEmail(), "already registered");
        }

        Municipality municipality = municipalityRepository.findByMunicipalityName(dto.getMunicipalityName())
                .orElseThrow(() -> new ResourceException("Municipality", "name", dto.getMunicipalityName(), "not found"));

        User user = new User();
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setAddress(dto.getAddress());
        user.setEnabled(true);
        user.setAccountNonExpired(true); // Ensure these are set for new users
        user.setAccountNonLocked(true);
        user.setCredentialsNonExpired(true);


        Role householdRole = roleRepository.findByName(RoleName.HOUSEHOLD)
                .orElseThrow(() -> new ResourceException("Role", "name", RoleName.HOUSEHOLD.name(), "not found"));
        Set<Role> roles = new HashSet<>();
        roles.add(householdRole);
        user.setRoles(roles);
        userRepository.save(user);

        Household household = new Household();
        household.setId(user.getId());
        household.setNumberOfMembers(dto.getNumberOfMembers());
        household.setHousingType(dto.getHousingType());
        household.setCollectionPreferences(dto.getCollectionPreferences());
        household.setLatitude(dto.getLatitude());
        household.setLongitude(dto.getLongitude());
        household.setMunicipality(municipality);
        household.setIsActive(true);
        householdRepository.save(household);
        logger.info("Household '{} {}' created successfully with ID: {}.", dto.getFirstName(), dto.getLastName(),
                household.getId());
    }

    @Transactional
    public HouseholdProfileDTO updateHousehold(Long id, HouseholdUpdateDTO dto) {
        Household household = householdRepository.findById(id)
                .orElseThrow(() -> new ResourceException("Household", String.valueOf(id)));

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceException("User", String.valueOf(id), "not found for household"));

        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setAddress(dto.getAddress());
        user.setEnabled(dto.getIsActive());
        userRepository.save(user);

        Municipality municipality = null;
        if (dto.getMunicipalityId() != null) {
            municipality = municipalityRepository.findById(dto.getMunicipalityId())
                    .orElseThrow(() -> new ResourceException("Municipality", String.valueOf(dto.getMunicipalityId())));
        } else if (dto.getArea() != null && !dto.getArea().isEmpty()) {
            municipality = municipalityRepository.findByMunicipalityName(dto.getArea())
                    .orElseThrow(() -> new ResourceException("Municipality", "name", dto.getArea(), "not found"));
        }

        household.setNumberOfMembers(dto.getNumberOfMembers());
        household.setHousingType(dto.getHousingType());
        household.setCollectionPreferences(dto.getCollectionPreferences());
        household.setLatitude(dto.getLatitude());
        household.setLongitude(dto.getLongitude());
        household.setMunicipality(municipality);
        household.setIsActive(dto.getIsActive());
        householdRepository.save(household);
        logger.info("Household with ID {} updated successfully.", id);
        return convertToHouseholdProfileDTO(household, user);
    }

    /**
     * Retrieves all households with optional filters and pagination.
     *
     * @param searchTerm Optional search term for household first name, last name, or email.
     * @param filterMunicipality Optional filter for municipality name.
     * @param filterHousingType Optional filter for housing type.
     * @param pageable Pageable object for pagination.
     * @return A paginated list of HouseholdProfileDTOs.
     */
    @Transactional(readOnly = true)
    public Page<HouseholdProfileDTO> getAllHouseholds(String searchTerm, String filterMunicipality, String filterHousingType, Pageable pageable) {
        logger.info("Fetching all households with pagination: {} and filters: search={}, municipality={}, housingType={}", pageable, searchTerm, filterMunicipality, filterHousingType);
        Page<Household> householdsPage;

        boolean hasSearchTerm = searchTerm != null && !searchTerm.isEmpty();
        boolean hasMunicipalityFilter = filterMunicipality != null && !filterMunicipality.isEmpty();
        boolean hasHousingTypeFilter = filterHousingType != null && !filterHousingType.isEmpty();

        Municipality municipality = null;
        if (hasMunicipalityFilter) {
            municipality = municipalityRepository.findByMunicipalityName(filterMunicipality)
                .orElse(null);
            if (municipality == null) { // If municipality not found, no households will match
                return new PageImpl<>(Collections.emptyList(), pageable, 0);
            }
        }

        HousingType housingType = null;
        if (hasHousingTypeFilter) {
            try {
                housingType = HousingType.valueOf(filterHousingType.toUpperCase());
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid HousingType filter: {}", filterHousingType);
                return new PageImpl<>(Collections.emptyList(), pageable, 0); // Return empty page for invalid type
            }
        }

        if (hasSearchTerm) {
            // Fetch users (which includes households) by search term
            Page<User> usersPage = userRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(searchTerm, searchTerm, searchTerm, PageRequest.of(0, Integer.MAX_VALUE));
            List<Long> householdIds = usersPage.getContent().stream()
                                            .filter(user -> user.getRoles().stream().anyMatch(role -> role.getName() == RoleName.HOUSEHOLD)) // Ensure it's a household
                                            .map(User::getId)
                                            .collect(Collectors.toList());

            if (householdIds.isEmpty()) {
                householdsPage = new PageImpl<>(Collections.emptyList(), pageable, 0);
            } else {
                if (hasMunicipalityFilter && hasHousingTypeFilter) {
                    householdsPage = householdRepository.findByIdInAndMunicipalityAndHousingType(householdIds, municipality, housingType, pageable);
                } else if (hasMunicipalityFilter) {
                    householdsPage = householdRepository.findByIdInAndMunicipality(householdIds, municipality, pageable);
                } else if (hasHousingTypeFilter) {
                    householdsPage = householdRepository.findByIdInAndHousingType(householdIds, housingType, pageable);
                } else {
                    householdsPage = householdRepository.findByIdIn(householdIds, pageable);
                }
            }
        } else if (hasMunicipalityFilter && hasHousingTypeFilter) {
            householdsPage = householdRepository.findByMunicipalityAndHousingType(municipality, housingType, pageable);
        } else if (hasMunicipalityFilter) {
            householdsPage = householdRepository.findByMunicipality(municipality, pageable);
        } else if (hasHousingTypeFilter) {
            householdsPage = householdRepository.findByHousingType(housingType, pageable);
        } else {
            householdsPage = householdRepository.findAll(pageable);
        }

        return householdsPage.map(household -> {
            User user = userRepository.findById(household.getId()).orElse(null);
            return convertToHouseholdProfileDTO(household, user);
        });
    }


    @Transactional
    public void deleteHousehold(Long id) {
        if (!householdRepository.existsById(id)) {
            throw new ResourceException("Household", String.valueOf(id));
        }
        householdRepository.deleteById(id);
        userRepository.deleteById(id);
        logger.info("Household and associated user with ID {} deleted successfully.", id);
    }

    @Transactional(readOnly = true)
    public HouseholdProfileDTO getHouseholdById(Long id) {
        Household household = householdRepository.findById(id)
            .orElseThrow(() -> new ResourceException("Household", String.valueOf(id)));
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceException("User", String.valueOf(id), "not found for household"));
        return convertToHouseholdProfileDTO(household, user);
    }

    private HouseholdProfileDTO convertToHouseholdProfileDTO(Household household, User user) {
        HouseholdProfileDTO dto = new HouseholdProfileDTO();
        dto.setId(household.getId());
        dto.setNumberOfMembers(household.getNumberOfMembers());
        dto.setHousingType(household.getHousingType());
        dto.setCollectionPreferences(household.getCollectionPreferences());
        dto.setLatitude(household.getLatitude());
        dto.setLongitude(household.getLongitude());
        dto.setIsActive(household.getIsActive());

        if (household.getMunicipality() != null) {
            dto.setArea(household.getMunicipality().getMunicipalityName());
        }
        if (user != null) {
            dto.setFirstName(user.getFirstName());
            dto.setLastName(user.getLastName());
            dto.setEmail(user.getEmail());
            dto.setPhoneNumber(user.getPhoneNumber());
            dto.setAddress(user.getAddress());
        }
        return dto;
    }

    // --- Dashboard & Statistics (NEW/UPDATED) ---

    /**
     * Retrieves global statistics for the admin dashboard.
     * Fetches real data from the database based on the specified period.
     * @param period The time period for the statistics (e.g., "day", "week", "month", "year").
     * @return A map containing various global statistics.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getGlobalStatistics(String period) {
        logger.info("Fetching global statistics for period: {}", period);
        Map<String, Object> stats = new HashMap<>();

        LocalDateTime startDate = calculateStartDate(period);
        LocalDateTime endDate = LocalDateTime.now();

        stats.put("totalUsers", userRepository.count());

        stats.put("totalCollectors", collectorRepository.count());

        stats.put("totalHouseholds", householdRepository.count());

        stats.put("totalMunicipalities", municipalityRepository.count());

        long activeServiceRequests = serviceRequestRepository.countByStatusAndCreatedAtAfter(ServiceRequestStatus.PENDING, startDate)
                                     + serviceRequestRepository.countByStatusAndCreatedAtAfter(ServiceRequestStatus.IN_PROGRESS, startDate);
        stats.put("activeServiceRequests", activeServiceRequests);

        long completedCollections = wasteCollectionRepository.findByCollectionDateBetween(startDate, endDate).size();
        stats.put("completedCollections", completedCollections);

        Double totalRevenue = paymentRepository.sumAmountByPaymentDateBetween(startDate, endDate);
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);

        long pendingDisputes = disputeRepository.countByStatusAndCreatedAtAfter(DisputeStatus.OPEN, startDate);
        stats.put("pendingDisputes", pendingDisputes);

        return stats;
    }

    /**
     * Retrieves recent activities for the admin dashboard.
     * Fetches real data from user registrations, completed service requests, and new disputes/notifications.
     * @return A list of recent activities.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRecentActivities() {
        logger.info("Fetching recent activities.");
        List<Map<String, Object>> activities = new ArrayList<>();

        userRepository.findTopNByOrderByCreationDateDesc(PageRequest.of(0, 5)).forEach(user -> {
            Map<String, Object> activity = new HashMap<>();
            activity.put("id", UUID.randomUUID().toString());
            activity.put("title", "Nouvel utilisateur enregistré");
            activity.put("description", user.getFirstName() + " " + user.getLastName() + " a rejoint la plateforme.");
            activity.put("type", "info");
            activity.put("icon", "user-plus");
            activity.put("timestamp", user.getCreationDate().toString());
            activity.put("timeAgo", formatTimeAgo(user.getCreationDate()));
            activities.add(activity);
        });

        serviceRequestRepository.findTop5ByStatusOrderByUpdatedAtDesc(ServiceRequestStatus.COMPLETED).forEach(req -> {
            Map<String, Object> activity = new HashMap<>();
            activity.put("id", req.getId());
            activity.put("title", "Collecte complétée");
            String collectorName = (req.getCollector() != null) ? req.getCollector().getFirstName() + " " + req.getCollector().getLastName() : "Unassigned Collector";
            activity.put("description", "Collecte #" + req.getId() + " terminée par " + collectorName + ".");
            activity.put("type", "success");
            activity.put("icon", "check-circle");
            activity.put("timestamp", req.getUpdatedAt().toString());
            activity.put("timeAgo", formatTimeAgo(req.getUpdatedAt()));
            activities.add(activity);
        });

        disputeRepository.findTop5ByStatusOrderByCreatedAtDesc(DisputeStatus.OPEN).forEach(dispute -> {
                Map<String, Object> activity = new HashMap<>();
                activity.put("id", dispute.getId());
                activity.put("title", dispute.getTitle());
                activity.put("description", "Nouveau litige: " + dispute.getTitle());
                activity.put("type", "warning");
                activity.put("icon", "exclamation-triangle");
                activity.put("timestamp", dispute.getCreatedAt().toString());
                activity.put("timeAgo", formatTimeAgo(dispute.getCreatedAt()));
                activities.add(activity);
            });

        notificationRepository.findTop5ByNotificationTypeInOrderByCreatedAtDesc(
            Arrays.asList(NotificationType.ALERT, NotificationType.INFO, NotificationType.SYSTEM_MESSAGE)).forEach(notification -> {
            Map<String, Object> activity = new HashMap<>();
            activity.put("id", notification.getId());
            activity.put("title", notification.getSubject());
            activity.put("description", notification.getMessage());
            String type;
            switch (notification.getNotificationType()) {
                case ALERT: type = "danger"; break;
                case SYSTEM_MESSAGE: type = "warning"; break;
                case INFO: type = "info"; break;
                default: type = "info";
            }
            activity.put("type", type);
            activity.put("icon", "bell");
            activity.put("timestamp", notification.getCreatedAt().toString());
            activity.put("timeAgo", formatTimeAgo(notification.getCreatedAt()));
            activities.add(activity);
        });


        activities.sort((a1, a2) -> {
            LocalDateTime time1 = LocalDateTime.parse((String) a1.get("timestamp"));
            LocalDateTime time2 = LocalDateTime.parse((String) a2.get("timestamp"));
            return time2.compareTo(time1);
        });

        return activities.stream().limit(10).collect(Collectors.toList());
    }

    /**
     * Retrieves performance metrics for the admin dashboard.
     * Fetches real data based on the specified period.
     * @param period The time period for the metrics.
     * @return A map containing performance metrics.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getPerformanceMetrics(String period) {
        logger.info("Fetching performance metrics for period: {}", period);
        Map<String, Object> metrics = new HashMap<>();

        LocalDateTime startDate = calculateStartDate(period);
        LocalDateTime endDate = LocalDateTime.now();

        long totalRequests = serviceRequestRepository.countByCreatedAtAfter(startDate);

        long completedRequests = wasteCollectionRepository.findByCollectionDateBetween(startDate, endDate).size();

        Double averageResponseTimeHours = serviceRequestRepository.findAverageResponseTimeHours(startDate, endDate);
        metrics.put("averageResponseTime", averageResponseTimeHours != null ? averageResponseTimeHours : 0.0);

        Double averageCollectionRating = serviceRequestRepository.findAverageCollectionRating(startDate, endDate);
        metrics.put("customerSatisfaction", averageCollectionRating != null ? averageCollectionRating : 0.0);

        double collectionEfficiency = (totalRequests > 0) ? ((double) completedRequests / totalRequests) * 100 : 0.0;
        metrics.put("collectionEfficiency", (int) Math.round(collectionEfficiency));

        return metrics;
    }

    /**
     * Retrieves system alerts for the admin dashboard from Notifications.
     * It fetches unread notifications of type ALERT.
     * @return A list of system alerts (converted from Notifications).
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSystemAlerts() {
        logger.info("Fetching system alerts from Notifications.");
        return notificationRepository.findByNotificationTypeAndIsReadFalseOrderByCreatedAtDesc(NotificationType.ALERT)
                                     .stream()
                                     .map(notification -> {
                                         Map<String, Object> alertMap = new HashMap<>();
                                         alertMap.put("id", notification.getId());
                                         alertMap.put("type", "CRITIQUE");
                                         alertMap.put("message", notification.getMessage());
                                         alertMap.put("timestamp", notification.getCreatedAt() != null ? notification.getCreatedAt().toString() : null);
                                         alertMap.put("read", notification.getIsRead());
                                         return alertMap;
                                     })
                                     .collect(Collectors.toList());
    }


    // --- Reporting ---

    /**
     * Initiates the asynchronous generation of a report using the provided configuration.
     * A new Report entity is created with a PENDING status, and the actual file
     * generation is delegated to the ReportGenerationService.
     *
     * @param reportConfigDTO Configuration for the report from the user.
     */
    @Transactional
    public void generateReport(ReportConfigDTO reportConfigDTO) {
        logger.info("Received request to generate report of type '{}' for period '{}'.",
                reportConfigDTO.getType(), reportConfigDTO.getPeriod());

        // 1. Create and save a new Report entity to track its status, using fields from your DTO.
        Report report = new Report();
        report.setTitle(reportConfigDTO.getTitle());
        report.setType(reportConfigDTO.getType());
        report.setPeriod(reportConfigDTO.getPeriod());
        report.setFormat(reportConfigDTO.getFormat());
        report.setStatus("pending"); // Using String status as per your Report entity
        report.setGeneratedDate(LocalDateTime.now());
        report.setGeneratedBy("admin"); // Replace with actual authenticated user

        // For simplicity, we'll assume municipalityId can be resolved to a name.
        // In a real app, you'd fetch the Municipality entity.
        if (reportConfigDTO.getMunicipalityId() != null) {
            report.setMunicipalityName("Municipality " + reportConfigDTO.getMunicipalityId());
        } else {
             report.setMunicipalityName("All");
        }

        Report savedReport = reportRepository.save(report);
        logger.info("Report entity created with ID: {}. Triggering async generation.", savedReport.getId());

        // 2. Trigger the asynchronous generation process.
        reportGenerationService.generateReportAsync(savedReport.getId(), reportConfigDTO);
    }

    /**
     * Fetches a list of all generated and pending reports from the database.
     *
     * @return A list of ReportDTOs, sorted by creation date.
     */
    @Transactional(readOnly = true)
    public List<ReportDTO> getGeneratedReports() {
        logger.info("Fetching list of all generated reports.");
        return reportRepository.findAll().stream()
                .sorted(Comparator.comparing(Report::getGeneratedDate).reversed())
                .map(this::convertToReportDTO)
                .collect(Collectors.toList());
    }
    
    public Page<ReportDTO> getGeneratedReports(Map<String, String> filters, Pageable pageable) {
        Specification<Report> spec = (root, query, cb) -> {
            Predicate predicate = cb.conjunction(); // Start with a true predicate

            String type = filters.get("type");
            if (type != null && !type.isEmpty()) {
                predicate = cb.and(predicate, cb.equal(root.get("type"), type));
            }

            String status = filters.get("status");
            if (status != null && !status.isEmpty()) {
                predicate = cb.and(predicate, cb.equal(root.get("status"), status));
            }

            String search = filters.get("search"); // This maps to 'title' in Report entity based on ReportsPage.js
            if (search != null && !search.isEmpty()) {
                predicate = cb.and(predicate, cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%"));
            }
            return predicate;
        };

        // Assuming reportRepository extends JpaSpecificationExecutor<Report>
        Page<Report> reportsPage = reportRepository.findAll(spec, pageable);
        return reportsPage.map(ReportMapper::toDTO); // Map Report entities to ReportDTOs
    }

    /**
     * Downloads the content of a completed report.
     *
     * @param id The ID of the report to download.
     * @return A byte array containing the report file content.
     * @throws IOException
     */
    @Transactional(readOnly = true)
    public byte[] downloadReport(Long id) throws IOException {
        logger.info("Processing download request for report with ID: {}", id);
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with ID: " + id));

        // Using String comparison for status
        if (!"completed".equalsIgnoreCase(report.getStatus())) {
            throw new ResourceException("Report", "status", report.getStatus(), "Report is not available for download.");
        }

        if (report.getFilePath() == null || report.getFilePath().isBlank()) {
             throw new ResourceException("Report", "filePath", "null", "File path is missing for the completed report.");
        }

        logger.info("Fetching report file from storage path: {}", report.getFilePath());
        return fileStorageService.downloadFile(report.getFilePath());
    }

    // --- Map Data ---

    @Transactional(readOnly = true)
    public Map<String, Object> getMapData(Map<String, String> mapConfigDTO) {
        logger.info("Fetching map data with config: {}", mapConfigDTO);
        return mapDataService.getGeoJsonMapData(mapConfigDTO);
    }

    // --- Predictive Analysis ---

    @Transactional(readOnly = true)
    public Map<String, Object> getPredictiveAnalysis(Map<String, Object> predictionConfigDTO) {
        logger.info("Performing predictive analysis with config: {}", predictionConfigDTO);
        return predictiveAnalysisService.getWastePredictionAnalysis(predictionConfigDTO);
    }

    // --- Helper Methods ---

    /**
     * Converts a Report entity to a ReportDTO, matching your DTO structure.
     * @param report The Report entity from the database.
     * @return The corresponding ReportDTO.
     */
    private ReportDTO convertToReportDTO(Report report) {
        // Assuming ReportDTO has a no-arg constructor and setters
        // If your ReportDTO only has a constructor with all arguments,
        // you'll need to update ReportDTO or provide the correct arguments here.
        ReportDTO dto = new ReportDTO();
        dto.setId(report.getId());
        dto.setTitle(report.getTitle());
        dto.setType(report.getType());
        dto.setPeriod(report.getPeriod());
        dto.setGeneratedDate(report.getGeneratedDate());
        dto.setStatus(report.getStatus());
        dto.setFormat(report.getFormat());
        dto.setFileSize(report.getFileSize());
        dto.setMunicipalityName(report.getMunicipalityName());
        dto.setGeneratedBy(report.getGeneratedBy());
        return dto;
    }

    /**
     * Retrieves aggregated waste collection data for the entire system (all municipalities).
     * This method calculates total collections, waste volume, and waste by type globally.
     * @param startDate - The start date for aggregation.
     * @param endDate - The end date for aggregation.
     * @return A map containing aggregated waste collection data.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getGlobalWasteCollectionData(LocalDateTime startDate, LocalDateTime endDate) {
        logger.info("Fetching global waste collection data from {} to {}.", startDate, endDate);
        Map<String, Object> data = new HashMap<>();

        long totalCollections = wasteCollectionRepository.countByCollectionDateBetween(startDate, endDate);
        data.put("totalCollections", totalCollections);

        Double totalWasteVolumeKg = serviceRequestRepository.sumActualWeightByCollectionDateBetween(startDate, endDate);
        data.put("totalWasteVolumeKg", totalWasteVolumeKg != null ? totalWasteVolumeKg : 0.0);

        double averageWastePerCollectionKg = (totalCollections > 0 && totalWasteVolumeKg != null) ? totalWasteVolumeKg / totalCollections : 0.0;
        data.put("averageWastePerCollectionKg", averageWastePerCollectionKg);

        data.put("pendingServiceRequests", serviceRequestRepository.countByStatus(ServiceRequestStatus.PENDING));
        data.put("completedServiceRequests", serviceRequestRepository.countByStatus(ServiceRequestStatus.COMPLETED));

        Map<String, Double> wasteVolumeByType = new HashMap<>();
        serviceRequestRepository.findByWasteTypeAndEstimatedVolumeAndCreatedAtBetween(startDate, endDate)
            .forEach(sr -> {
                String typeName = sr.getWasteType() != null ? sr.getWasteType().name() : "UNKNOWN";
                wasteVolumeByType.merge(typeName, sr.getEstimatedVolume() != null ? sr.getEstimatedVolume() : 0.0, Double::sum);
            });

        for (WasteType type : WasteType.values()) {
            wasteVolumeByType.putIfAbsent(type.name(), 0.0);
        }
        data.put("wasteVolumeByType", wasteVolumeByType);

        return data;
    }

    /**
     * Performs aggregated metrics analysis for the entire system (all municipalities).
     * @param startDate - The start date for analysis.
     * @param endDate - The end date for analysis.
     * @return A map containing various global metrics.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getGlobalMetricsAnalysis(LocalDateTime startDate, LocalDateTime endDate) {
        logger.info("Fetching global metrics analysis from {} to {}.", startDate, endDate);
        Map<String, Object> metrics = new HashMap<>();

        metrics.put("totalHouseholds", householdRepository.count());
        metrics.put("activeHouseholds", householdRepository.countByIsActiveTrue());

        metrics.put("totalCollectors", collectorRepository.count());
        metrics.put("activeCollectors", collectorRepository.countByStatus(CollectorStatus.ACTIVE));

        Double avgResponseTime = serviceRequestRepository.findAverageResponseTimeHours(startDate, endDate);
        metrics.put("averageResponseTime", avgResponseTime != null ? avgResponseTime : 0.0);

        Double avgCollectionRating = serviceRequestRepository.findAverageCollectionRating(startDate, endDate);
        metrics.put("customerSatisfaction", avgCollectionRating != null ? avgCollectionRating : 0.0);

        metrics.put("totalDisputes", disputeRepository.count());

        return metrics;
    }

    /**
     * Identifies the count of underserved areas across all municipalities.
     * Uses the `findUnderservedAreas()` method from HouseholdRepository.
     * @return The total count of underserved areas.
     */
    @Transactional(readOnly = true)
    public Integer getGlobalUnderservedAreasCount() {
        logger.info("Fetching global underserved areas count.");
        List<Household> underservedHouseholds = householdRepository.findUnderservedAreas();
        return underservedHouseholds.size();
    }


    // --- Helper Methods ---

    /**
     * Calculates the start date based on the provided period.
     * @param period The period string (e.g., "day", "week", "month", "year").
     * @return The LocalDateTime representing the start of the period.
     */
    private LocalDateTime calculateStartDate(String period) {
        LocalDateTime now = LocalDateTime.now();
        switch (period.toLowerCase()) {
            case "day":
                return now.minusDays(1); // Last 24 hours
            case "week":
                return now.minusWeeks(1);
            case "month":
                return now.minusMonths(1);
            case "year":
                return now.minusYears(1);
            default:
                return now.minusWeeks(1); // Default to week if invalid period
        }
    }

    /**
     * Formats a LocalDateTime into a human-readable "time ago" string.
     * This is a simplified example and might need a more robust library for production.
     * @param dateTime The LocalDateTime to format.
     * @return A string like "Il y a 5 min" or "Il y a 2 jours".
     */
    private String formatTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "N/A";

        LocalDateTime now = LocalDateTime.now();
        long minutes = ChronoUnit.MINUTES.between(dateTime, now);
        long hours = ChronoUnit.HOURS.between(dateTime, now);
        long days = ChronoUnit.DAYS.between(dateTime, now);
        long weeks = ChronoUnit.WEEKS.between(dateTime, now);
        long months = ChronoUnit.MONTHS.between(dateTime, now);
        long years = ChronoUnit.YEARS.between(dateTime, now);

        if (years > 0) return "Il y a " + years + " an" + (years > 1 ? "s" : "") + " " + (months % 12) + " mois";
        if (months > 0) return "Il y a " + months + " mois" + " " + (weeks % 4) + " semaines";
        if (weeks > 0) return "Il y a " + weeks + " semaine" + (weeks > 1 ? "s" : "") + " " + (days % 7) + " jours";
        if (hours > 0) return "Il y a " + hours + " heure" + (hours > 1 ? "s" : "") + " " + (minutes % 60) + " min";
        if (minutes > 0) return "Il y a " + minutes + " min";
        return "À l'instant";
    }

    /**
     * Creates and sends notifications to specified recipients based on the request.
     *
     * @param request The DTO containing notification details and targeting options.
     * @throws ResourceException if recipient users or roles are not found.
     */
    @Transactional
    public void sendNotifications(CreateNotificationRequest request) {
        logger.info("Attempting to send notifications. Target Audience: {}", request.getTargetAudience());

        List<User> recipients = new ArrayList<>();

        switch (request.getTargetAudience()) {
            case "ALL":
                recipients = userRepository.findAll(); // Get all users
                break;
            case "ROLE":
                if (request.getTargetRole() == null || request.getTargetRole().isEmpty()) {
                    throw new ResourceException("Target Role", "null", "Target role must be specified for ROLE audience.");
                }
                try {
                    Role targetRoleEntity = roleRepository.findByName(RoleName.valueOf(request.getTargetRole()))
                            .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + request.getTargetRole()));
                    recipients = userRepository.findByRolesContaining(targetRoleEntity); // Assuming findByRolesContaining returns a List<User>
                } catch (IllegalArgumentException e) {
                    throw new ResourceException("Role", "name", request.getTargetRole(), "Invalid role name provided.");
                }
                break;
            case "SPECIFIC_USERS":
                if (request.getTargetUserIds() == null || request.getTargetUserIds().isEmpty()) {
                    throw new ResourceException("Target User IDs", "null", "Specific user IDs must be provided for SPECIFIC_USERS audience.");
                }
                recipients = userRepository.findAllById(request.getTargetUserIds());
                if (recipients.size() != request.getTargetUserIds().size()) {
                    // Log or throw if some users were not found
                    logger.warn("Not all specified users were found. Requested: {}, Found: {}",
                            request.getTargetUserIds().size(), recipients.size());
                }
                break;
            default:
                throw new ResourceException("Target Audience", request.getTargetAudience(), "Invalid target audience specified.");
        }

        if (recipients.isEmpty()) {
            logger.warn("No recipients found for the specified criteria.");
            return; // No recipients, nothing to send
        }

        for (User recipient : recipients) {
            NotificationDTO notificationDTO = new NotificationDTO();
            notificationDTO.setRecipientId(recipient.getId());
            notificationDTO.setSubject(request.getSubject());
            notificationDTO.setMessage(request.getMessage());
            notificationDTO.setNotificationType(request.getNotificationType());
            notificationDTO.setServiceRequestId(request.getServiceRequestId());
            notificationDTO.setPaymentId(request.getPaymentId());
            notificationDTO.setDisputeId(request.getDisputeId());
            notificationDTO.setIsRead(false); // New notifications are unread by default

            try {
                notificationService.createNotification(notificationDTO);
                logger.info("Notification sent to user {}: Subject '{}'", recipient.getEmail(), request.getSubject());
            } catch (Exception e) {
                logger.error("Failed to send notification to user {}: {}", recipient.getEmail(), e.getMessage(), e);
                // Depending on requirements, you might want to collect failures or rethrow.
                // For now, log and continue to other recipients.
            }
        }
        logger.info("Notifications sending process completed for target audience: {}", request.getTargetAudience());
    }
}
