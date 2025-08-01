// MunicipalityService.java
package com.wastecollect.backend.service;

import com.wastecollect.backend.exception.ResourceException;
import com.wastecollect.backend.exception.RequestValidationException;
import com.wastecollect.backend.repository.CollectorRepository; // New import
import com.wastecollect.backend.repository.HouseholdRepository; // New import
import com.wastecollect.backend.repository.MunicipalManagerRepository;
import com.wastecollect.backend.repository.MunicipalityRepository;
import com.wastecollect.backend.repository.RoleRepository;
import com.wastecollect.backend.repository.ServiceRequestRepository; // New import
import com.wastecollect.backend.repository.WasteCollectionRepository; // New import
import com.wastecollect.common.dto.ComparativeDataDTO; // New import
import com.wastecollect.common.dto.DetailedReportDTO; // New import
import com.wastecollect.common.dto.HouseholdDTO;
import com.wastecollect.common.dto.MapPointDTO; // New import
import com.wastecollect.common.dto.MunicipalityCreationDTO;
import com.wastecollect.common.dto.MunicipalityDTO;
import com.wastecollect.common.dto.MunicipalityMetricsDTO; // New import
import com.wastecollect.common.dto.WasteCollectionDataDTO; // New import
import com.wastecollect.common.dto.WasteMappingDTO; // New import
import com.wastecollect.common.models.Household; // New import
import com.wastecollect.common.models.MunicipalManager;
import com.wastecollect.common.models.Municipality;
import com.wastecollect.common.models.Role;
import com.wastecollect.common.models.ServiceRequest; // New import
import com.wastecollect.common.models.WasteCollection; // New import
import com.wastecollect.common.utils.CollectorStatus; // New import
import com.wastecollect.common.utils.RoleName;
import com.wastecollect.common.utils.ServiceRequestStatus; // New import
import com.wastecollect.common.utils.WasteType; // New import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Service
public class MunicipalityService {

    private static final Logger logger = LoggerFactory.getLogger(MunicipalityService.class);

    private final MunicipalityRepository municipalityRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final MunicipalManagerRepository municipalManagerRepository;
    private final WasteCollectionRepository wasteCollectionRepository; // Injected
    private final ServiceRequestRepository serviceRequestRepository;   // Injected
    private final HouseholdRepository householdRepository;            // Injected
    private final CollectorRepository collectorRepository;            // Injected

    @Autowired
    public MunicipalityService(MunicipalityRepository municipalityRepository,
                               RoleRepository roleRepository,
                               PasswordEncoder passwordEncoder,
                               MunicipalManagerRepository municipalManagerRepository,
                               WasteCollectionRepository wasteCollectionRepository,
                               ServiceRequestRepository serviceRequestRepository,
                               HouseholdRepository householdRepository,
                               CollectorRepository collectorRepository) {
        this.municipalityRepository = municipalityRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.municipalManagerRepository = municipalManagerRepository;
        this.wasteCollectionRepository = wasteCollectionRepository;
        this.serviceRequestRepository = serviceRequestRepository;
        this.householdRepository = householdRepository;
        this.collectorRepository = collectorRepository;
    }

    @Transactional
    public MunicipalityDTO createMunicipality(MunicipalityCreationDTO municipalityDTO) {
        if (municipalityRepository.findByMunicipalityName(municipalityDTO.getMunicipalityName()).isPresent()) {
            throw new RequestValidationException("Municipality name already exists: " + municipalityDTO.getMunicipalityName());
        }

        Municipality newMunicipality = new Municipality(
                municipalityDTO.getMunicipalityName(),
                municipalityDTO.getProvince(),
                municipalityDTO.getCountry(),
                municipalityDTO.getPopulation(),
                municipalityDTO.getWasteManagementBudget()
        );

        // Enable the municipality by default on creation
        newMunicipality.setEnabled(true);

        Municipality savedMunicipality = municipalityRepository.save(newMunicipality);

        // Create associated MunicipalManager
        Role municipalManagerRole = roleRepository.findByName(RoleName.MUNICIPAL_MANAGER)
                .orElseThrow(() -> new ResourceException("Role", "name", RoleName.MUNICIPAL_MANAGER.name()));

        MunicipalManager municipalManager = new MunicipalManager(
                municipalityDTO.getManagerFirstName(),
                municipalityDTO.getManagerLastName(),
                municipalityDTO.getManagerEmail(),
                passwordEncoder.encode(municipalityDTO.getManagerPassword()),
                municipalityDTO.getManagerPhoneNumber(),
                municipalityDTO.getManagerAddress(),
                savedMunicipality
        );
        Set<Role> roles = new HashSet<>();
        roles.add(municipalManagerRole);
        municipalManager.setRoles(roles);
        municipalManagerRepository.save(municipalManager);

        return convertToDTO(savedMunicipality);
    }

    @Transactional
    public Optional<Municipality> getCurrentMunicipality() {
        // Get only the first result
        Pageable pageable = PageRequest.of(0, 1);
        List<Municipality> municipalities = municipalityRepository.findEnabledMunicipalitiesOrderedById(pageable);
        return municipalities.isEmpty() ? Optional.empty() : Optional.of(municipalities.get(0));
    }

    @Transactional(readOnly = true)
    public List<MunicipalityDTO> getAllMunicipalities() {
        return municipalityRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MunicipalityDTO getMunicipalityById(Long id) {
        Municipality municipality = municipalityRepository.findById(id)
                .orElseThrow(() -> new ResourceException("Municipality", "id", id.toString()));
        return convertToDTO(municipality);
    }

    @Transactional
    public Optional<Municipality> getTopEnabledMunicipality() {
        return municipalityRepository.findTopByEnabledTrueOrderByIdAsc();
    }

    @Transactional
    public MunicipalityDTO updateMunicipality(Long id, MunicipalityDTO municipalityDTO) {
        Municipality existingMunicipality = municipalityRepository.findById(id)
                .orElseThrow(() -> new ResourceException("Municipality", "id", id.toString()));

        existingMunicipality.setMunicipalityName(municipalityDTO.getMunicipalityName());
        existingMunicipality.setProvince(municipalityDTO.getProvince());
        existingMunicipality.setCountry(municipalityDTO.getCountry());
        existingMunicipality.setPopulation(municipalityDTO.getPopulation());
        existingMunicipality.setWasteManagementBudget(municipalityDTO.getWasteManagementBudget());
        existingMunicipality.setEnabled(municipalityDTO.getEnabled());

        return convertToDTO(municipalityRepository.save(existingMunicipality));
    }

    @Transactional
    public void deleteMunicipality(Long id) {
        if (!municipalityRepository.existsById(id)) {
            throw new ResourceException("Municipality", "id", id.toString());
        }
        municipalityRepository.deleteById(id);
    }

    private MunicipalityDTO convertToDTO(Municipality municipality) {
        return new MunicipalityDTO(
                municipality.getId(),
                municipality.getMunicipalityName(),
                municipality.getProvince(),
                municipality.getCountry(),
                municipality.getPopulation(),
                municipality.getWasteManagementBudget(),
                municipality.isEnabled()
        );
    }

    /**
     * Retrieves aggregated waste collection data for the municipality.
     * This implementation fetches actual data from WasteCollection and ServiceRequest repositories.
     *
     * @param municipalityId The ID of the municipality.
     * @param startDate The start date for the data aggregation.
     * @param endDate The end date for the data aggregation.
     * @return A WasteCollectionDataDTO representing aggregated waste collection data.
     */
    @Transactional(readOnly = true)
    public WasteCollectionDataDTO getWasteCollectionData(Long municipalityId, LocalDateTime startDate, LocalDateTime endDate) {
        logger.info("Fetching waste collection data for municipality ID: {} from {} to {}", municipalityId, startDate, endDate);
        Municipality municipality = municipalityRepository.findById(municipalityId)
                .orElseThrow(() -> new ResourceException("Municipality", "id", municipalityId.toString()));

        List<WasteCollection> collections = wasteCollectionRepository
                .findByMunicipalityAndCollectionDateBetween(municipality, startDate, endDate);

        Long totalCollections = (long) collections.size();
        Double totalWasteVolumeKg = collections.stream()
                .mapToDouble(WasteCollection::getActualWeight)
                .sum();
        Double averageWastePerCollectionKg = totalCollections > 0 ? totalWasteVolumeKg / totalCollections : 0.0;

        List<ServiceRequest> serviceRequests = serviceRequestRepository
                .findByMunicipalityAndCreatedAtBetween(municipality, startDate, endDate);

        Long pendingServiceRequests = serviceRequests.stream()
                .filter(sr -> sr.getStatus() == ServiceRequestStatus.PENDING || sr.getStatus() == ServiceRequestStatus.IN_PROGRESS)
                .count();

        Long completedServiceRequests = serviceRequests.stream()
                .filter(sr -> sr.getStatus() == ServiceRequestStatus.COMPLETED)
                .count();

        Map<WasteType, Double> wasteVolumeByType = collections.stream()
                .collect(Collectors.groupingBy(
                        wc -> (WasteType) (wc.getServiceRequest() != null ? wc.getServiceRequest().getWasteType() : WasteType.OTHER), // Explicit cast added
                        Collectors.summingDouble(WasteCollection::getActualWeight)
                ));

        return new WasteCollectionDataDTO(
                totalCollections,
                totalWasteVolumeKg,
                averageWastePerCollectionKg,
                pendingServiceRequests,
                completedServiceRequests,
                wasteVolumeByType
        );
    }

    /**
     * Identifies underserved areas within the municipality based on service request frequency and last collection.
     * This implementation fetches actual data from Household, ServiceRequest, and WasteCollection repositories.
     *
     * @param municipalityId The ID of the municipality.
     * @param daysThreshold The number of days since last collection to consider an area underserved.
     * @param minPendingRequests The minimum number of pending requests to consider an area underserved.
     * @return A list of HouseholdDTOs representing underserved areas.
     */
    @Transactional(readOnly = true)
    public List<HouseholdDTO> identifyUnderservedAreas(Long municipalityId, int daysThreshold, int minPendingRequests) {
        logger.info("Identifying underserved areas for municipality ID: {}", municipalityId);
        Municipality municipality = municipalityRepository.findById(municipalityId)
                .orElseThrow(() -> new ResourceException("Municipality", "id", municipalityId.toString()));

        List<Household> householdsInMunicipality = householdRepository.findByMunicipality(municipality);
        List<HouseholdDTO> underservedAreas = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (Household household : householdsInMunicipality) {
            Optional<WasteCollection> lastCollectionOpt = wasteCollectionRepository
                    .findTopByHouseholdAndMunicipalityOrderByCollectionDateDesc(household, municipality);

            long daysSinceLastCollection = -1;
            if (lastCollectionOpt.isPresent()) {
                daysSinceLastCollection = Duration.between(lastCollectionOpt.get().getCollectionDate(), now).toDays();
            }

            long pendingRequestsCount = serviceRequestRepository
                    .countByHouseholdAndStatusIn(household, List.of(ServiceRequestStatus.PENDING, ServiceRequestStatus.IN_PROGRESS));

            // Define "underserved" criteria
            boolean isUnderserved = false;
            if (daysSinceLastCollection == -1 || daysSinceLastCollection > daysThreshold) { // No collection ever or too long ago
                isUnderserved = true;
            }
            if (pendingRequestsCount >= minPendingRequests) { // Multiple pending requests
                isUnderserved = true;
            }

            if (isUnderserved) {
                // Populate HouseholdDTO with relevant details for underserved areas
                HouseholdDTO dto = new HouseholdDTO(
                    household.getId(),
                    household.getFirstName(),
                    household.getLastName(),
                    household.getEmail(),
                    household.getPhoneNumber(),
                    household.getAddress(),
                    household.getLatitude(), // Assuming these are for the household itself
                    household.getLongitude(),
                    household.getNumberOfMembers(),
                    household.getHousingType() != null ? household.getHousingType().name() : null,
                    household.getCollectionPreferences(),
                    household.getMunicipality() != null ? household.getMunicipality().getMunicipalityName() : null,
                    (int) (daysSinceLastCollection != -1 ? daysSinceLastCollection : 999), // Days since last collection
                    (int) ((1 - (double) pendingRequestsCount / (pendingRequestsCount + 10)) * 100) // Simple dummy coverage based on pending requests
                );
                underservedAreas.add(dto);
            }
        }
        // Sort by days since last collection (most underserved first)
        underservedAreas.sort(Comparator.comparing(HouseholdDTO::getDaysSinceLastCollection).reversed());
        return underservedAreas;
    }

    /**
     * Performs metrics analysis for the municipality's waste management.
     * This implementation fetches actual data from relevant repositories.
     *
     * @param municipalityId The ID of the municipality.
     * @param startDate The start date for metrics calculation.
     * @param endDate The end date for metrics calculation.
     * @return A MunicipalityMetricsDTO representing key performance indicators.
     */
    @Transactional(readOnly = true)
    public MunicipalityMetricsDTO getMetricsAnalysis(Long municipalityId, LocalDateTime startDate, LocalDateTime endDate) {
        logger.info("Performing metrics analysis for municipality ID: {} from {} to {}", municipalityId, startDate, endDate);
        Municipality municipality = municipalityRepository.findById(municipalityId)
                .orElseThrow(() -> new ResourceException("Municipality", "id", municipalityId.toString()));

        long totalHouseholds = householdRepository.countByMunicipality(municipality);
        long activeHouseholds = householdRepository.countByMunicipalityAndIsActive(municipality, true);

        long totalCollectors = collectorRepository.countByMunicipality(municipality);
        long activeCollectors = collectorRepository.countByMunicipalityAndStatus(municipality, CollectorStatus.ACTIVE);

        List<ServiceRequest> completedRequests = serviceRequestRepository
                .findByMunicipalityAndStatusAndCreatedAtBetween(municipality, ServiceRequestStatus.COMPLETED, startDate, endDate);

        Double averageResponseTimeHours = completedRequests.stream()
                .filter(sr -> sr.getCreatedAt() != null && sr.getUpdatedAt() != null)
                .mapToLong(sr -> ChronoUnit.HOURS.between(sr.getCreatedAt(), sr.getUpdatedAt()))
                .average()
                .orElse(0.0);

        Double averageCollectionRating = wasteCollectionRepository.findByMunicipalityAndCollectionDateBetween(municipality, startDate, endDate)
                .stream()
                .filter(wc -> wc.getCollectorRating() != null)
                .mapToInt(WasteCollection::getCollectorRating)
                .average()
                .orElse(0.0);

        long totalDisputes = serviceRequestRepository.countByMunicipalityAndStatus(municipality, ServiceRequestStatus.DISPUTED); // Assuming DISPUTED status

        return new MunicipalityMetricsDTO(
                totalHouseholds,
                activeHouseholds,
                totalCollectors,
                activeCollectors,
                averageResponseTimeHours,
                averageCollectionRating,
                totalDisputes
        );
    }

    /**
     * Retrieves waste mapping data (collection points, service request locations) for the municipality.
     * This implementation fetches actual geographical data from WasteCollection and ServiceRequest repositories.
     *
     * @param municipalityId The ID of the municipality.
     * @param startDate The start date for mapping data.
     * @param endDate The end date for mapping data.
     * @return A WasteMappingDTO containing a list of geographical points.
     */
    @Transactional(readOnly = true)
    public WasteMappingDTO getWasteMappingData(Long municipalityId, LocalDateTime startDate, LocalDateTime endDate) {
        logger.info("Fetching waste mapping data for municipality ID: {} from {} to {}", municipalityId, startDate, endDate);
        Municipality municipality = municipalityRepository.findById(municipalityId)
                .orElseThrow(() -> new ResourceException("Municipality", "id", municipalityId.toString()));

        List<MapPointDTO> mapPoints = new ArrayList<>();

        // Add waste collection points
        List<WasteCollection> collections = wasteCollectionRepository
                .findByMunicipalityAndCollectionDateBetween(municipality, startDate, endDate);
        collections.stream()
                .filter(wc -> wc.getLatitude() != null && wc.getLongitude() != null)
                .map(wc -> new MapPointDTO(
                        wc.getLatitude(),
                        wc.getLongitude(),
                        "collection",
                        "Collected: " + wc.getActualWeight() + "kg at " + wc.getAddresse(),
                        wc.getStatus() != null ? wc.getStatus().name() : ServiceRequestStatus.COMPLETED.name(),
                        wc.getId()
                ))
                .forEach(mapPoints::add);

        // Add service request locations (especially pending/disputed ones)
        List<ServiceRequest> serviceRequests = serviceRequestRepository
                .findByMunicipalityAndCreatedAtBetween(municipality, startDate, endDate);
        serviceRequests.stream()
                .filter(sr -> sr.getHousehold() != null && sr.getHousehold().getLatitude() != null && sr.getHousehold().getLongitude() != null)
                .map(sr -> new MapPointDTO(
                        sr.getHousehold().getLatitude(),
                        sr.getHousehold().getLongitude(),
                        "service_request",
                        "Request for " + sr.getWasteType().name() + ": " + sr.getDescription(),
                        sr.getStatus() != null ? sr.getStatus().name() : "UNKNOWN",
                        sr.getId()
                ))
                .forEach(mapPoints::add);

        // Add locations of currently underserved households (if needed for mapping)
        // This could reuse the logic from identifyUnderservedAreas if we want to explicitly map them
        // For simplicity, let's just include all households for now if they have geo-coords
        householdRepository.findByMunicipality(municipality, null).stream()
                .filter(h -> h.getLatitude() != null && h.getLongitude() != null)
                .map(h -> new MapPointDTO(
                        h.getLatitude(),
                        h.getLongitude(),
                        "household",
                        "Household: " + h.getAddress(),
                        h.getIsActive() ? "ACTIVE" : "INACTIVE", // Or underserved status
                        h.getId()
                ))
                .forEach(mapPoints::add);


        return new WasteMappingDTO(mapPoints);
    }

    /**
     * Generates a comprehensive detailed report for the municipality's waste management.
     * This combines data from other service methods.
     *
     * @param municipalityId The ID of the municipality.
     * @param startDate The start date for the report data.
     * @param endDate The end date for the report data.
     * @param daysThresholdUnderserved The threshold for days since last collection for underserved areas.
     * @param minPendingRequestsUnderserved The minimum pending requests for underserved areas.
     * @return A DetailedReportDTO containing all compiled report sections.
     */
    @Transactional(readOnly = true)
    public DetailedReportDTO generateDetailedReport(Long municipalityId, LocalDateTime startDate, LocalDateTime endDate,
                                                    int daysThresholdUnderserved, int minPendingRequestsUnderserved) {
        logger.info("Generating detailed report for municipality ID: {} from {} to {}", municipalityId, startDate, endDate);
        MunicipalityDTO municipalityInfo = getMunicipalityById(municipalityId);
        WasteCollectionDataDTO collectionData = getWasteCollectionData(municipalityId, startDate, endDate);
        MunicipalityMetricsDTO metrics = getMetricsAnalysis(municipalityId, startDate, endDate);
        List<HouseholdDTO> underservedAreas = identifyUnderservedAreas(municipalityId, daysThresholdUnderserved, minPendingRequestsUnderserved);

        return new DetailedReportDTO(
                municipalityInfo,
                collectionData,
                metrics,
                underservedAreas
        );
    }

    /**
     * Retrieves comparative data for the municipality against others or benchmarks.
     * This implementation provides a basic comparison with the overall average of all municipalities.
     *
     * @param municipalityId The ID of the municipality.
     * @param startDate The start date for comparative data.
     * @param endDate The end date for comparative data.
     * @return A ComparativeDataDTO containing comparative data.
     */
    @Transactional(readOnly = true)
    public ComparativeDataDTO getComparativeMunicipalityData(Long municipalityId, LocalDateTime startDate, LocalDateTime endDate) {
        logger.info("Fetching comparative municipality data for municipality ID: {} from {} to {}", municipalityId, startDate, endDate);
        MunicipalityDTO currentMunicipalityInfo = getMunicipalityById(municipalityId);

        // Get current municipality's data
        WasteCollectionDataDTO currentCollectionData = getWasteCollectionData(municipalityId, startDate, endDate);
        MunicipalityMetricsDTO currentMetrics = getMetricsAnalysis(municipalityId, startDate, endDate);

        Map<String, Object> currentMunicipalityData = new HashMap<>();
        currentMunicipalityData.put("totalCollections", currentCollectionData.getTotalCollections());
        currentMunicipalityData.put("totalWasteVolumeKg", currentCollectionData.getTotalWasteVolumeKg());
        currentMunicipalityData.put("activeHouseholds", currentMetrics.getActiveHouseholds());
        currentMunicipalityData.put("averageResponseTimeHours", currentMetrics.getAverageResponseTimeHours());
        currentMunicipalityData.put("averageCollectionRating", currentMetrics.getAverageCollectionRating());

        // Calculate overall average metrics across all municipalities (for comparison)
        List<Municipality> allMunicipalities = municipalityRepository.findAll();
        long totalCollectionsOverall = 0L;
        double totalWasteVolumeOverall = 0.0;
        double totalAvgResponseTimeOverall = 0.0;
        double totalAvgCollectionRatingOverall = 0.0;
        long totalActiveHouseholdsOverall = 0L;
        int municipalitiesWithData = 0;

        for (Municipality muni : allMunicipalities) {
            try {
                WasteCollectionDataDTO muniCollectionData = getWasteCollectionData(muni.getId(), startDate, endDate);
                MunicipalityMetricsDTO muniMetrics = getMetricsAnalysis(muni.getId(), startDate, endDate);

                totalCollectionsOverall += muniCollectionData.getTotalCollections();
                totalWasteVolumeOverall += muniCollectionData.getTotalWasteVolumeKg();
                totalActiveHouseholdsOverall += muniMetrics.getActiveHouseholds();
                totalAvgResponseTimeOverall += muniMetrics.getAverageResponseTimeHours();
                totalAvgCollectionRatingOverall += muniMetrics.getAverageCollectionRating();
                municipalitiesWithData++;
            } catch (ResourceException e) {
                logger.warn("Skipping municipality {} for comparative data due to error: {}", muni.getId(), e.getMessage());
            }
        }

        Map<String, Object> comparativeMetrics = new HashMap<>();
        comparativeMetrics.put("averageTotalCollections", municipalitiesWithData > 0 ? (double) totalCollectionsOverall / municipalitiesWithData : 0.0);
        comparativeMetrics.put("averageTotalWasteVolumeKg", municipalitiesWithData > 0 ? totalWasteVolumeOverall / municipalitiesWithData : 0.0);
        comparativeMetrics.put("averageActiveHouseholds", municipalitiesWithData > 0 ? (double) totalActiveHouseholdsOverall / municipalitiesWithData : 0.0);
        comparativeMetrics.put("averageResponseTimeHours", municipalitiesWithData > 0 ? totalAvgResponseTimeOverall / municipalitiesWithData : 0.0);
        comparativeMetrics.put("averageCollectionRating", municipalitiesWithData > 0 ? totalAvgCollectionRatingOverall / municipalitiesWithData : 0.0);

        // Calculate performance ratios
        Map<String, Double> performanceRatios = new HashMap<>();
        performanceRatios.put("collectionsRatio", (Double) currentMunicipalityData.get("totalCollections") / (Double) comparativeMetrics.get("averageTotalCollections"));
        performanceRatios.put("wasteVolumeRatio", (Double) currentMunicipalityData.get("totalWasteVolumeKg") / (Double) comparativeMetrics.get("averageTotalWasteVolumeKg"));
        performanceRatios.put("activeHouseholdsRatio", (Double) currentMunicipalityData.get("activeHouseholds") / (Double) comparativeMetrics.get("averageActiveHouseholds"));
        performanceRatios.put("responseTimeRatio", (Double) currentMunicipalityData.get("averageResponseTimeHours") / (Double) comparativeMetrics.get("averageResponseTimeHours"));
        performanceRatios.put("collectionRatingRatio", (Double) currentMunicipalityData.get("averageCollectionRating") / (Double) comparativeMetrics.get("averageCollectionRating"));


        return new ComparativeDataDTO(
                currentMunicipalityInfo,
                "overall_average",
                currentMunicipalityData,
                comparativeMetrics,
                performanceRatios
        );
    }
}
