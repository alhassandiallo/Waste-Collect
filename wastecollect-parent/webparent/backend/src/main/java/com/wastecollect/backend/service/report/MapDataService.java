package com.wastecollect.backend.service.report;

import com.wastecollect.backend.repository.CollectorRepository;
import com.wastecollect.backend.repository.HouseholdRepository;
import com.wastecollect.backend.repository.ServiceRequestRepository;
import com.wastecollect.common.models.Household;
import com.wastecollect.common.models.ServiceRequest;
import com.wastecollect.common.utils.ServiceRequestStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service responsible for generating GeoJSON data for map visualization.
 * It retrieves locations of households requiring collection.
 * Collector locations are NOT included as per updated requirements.
 */
@Service
public class MapDataService {

    private final ServiceRequestRepository serviceRequestRepository;

    /**
     * Constructs a MapDataService with necessary repositories.
     * @param householdRepository Repository for Household entities.
     * @param collectorRepository Repository for Collector entities.
     * @param serviceRequestRepository Repository for ServiceRequest entities.
     */
    public MapDataService(HouseholdRepository householdRepository,
                          CollectorRepository collectorRepository,
                          ServiceRequestRepository serviceRequestRepository) {
        this.serviceRequestRepository = serviceRequestRepository;
    }

    /**
     * Generates a GeoJSON FeatureCollection containing points for:
     * 1. Households with pending waste collection requests.
     *
     * @param config A map for configuration parameters (e.g., filters). Currently not extensively used,
     * but can be extended for filtering by municipality, service type, etc.
     * @return A Map representing the GeoJSON FeatureCollection.
     */
    public Map<String, Object> getGeoJsonMapData(Map<String, String> config) {
        List<Map<String, Object>> features = new ArrayList<>();

        // --- 1. Add households that need collection (from PENDING service requests) ---
        List<ServiceRequest> pendingRequests = serviceRequestRepository.findByStatus(ServiceRequestStatus.PENDING);
        for (ServiceRequest request : pendingRequests) {
            Household household = request.getHousehold();
            // Ensure household and its location data are available
            if (household != null && household.getLatitude() != null && household.getLongitude() != null) {
                features.add(createGeoJsonFeature(
                    "Point",
                    List.of(household.getLongitude(), household.getLatitude()),
                    Map.of(
                        "name", household.getFirstName() + " " + household.getLastName(),
                        "status", "needs_collection", // Custom status for map visualization
                        "type", "household",
                        "requestId", request.getId()
                    )
                ));
            }
        }

        // Collectors are no longer plotted on the map as their latitude/longitude fields have been removed.
        // If plotting of collectors based on a different mechanism (e.g., associated depot) is needed later,
        // this section would be updated accordingly.

        // Construct the GeoJSON FeatureCollection object
        Map<String, Object> featureCollection = new HashMap<>();
        featureCollection.put("type", "FeatureCollection");
        featureCollection.put("features", features);
        return featureCollection;
    }

    /**
     * Helper method to create a GeoJSON Feature object.
     *
     * @param type The geometry type (e.g., "Point", "LineString", "Polygon").
     * @param coordinates The coordinates of the geometry. For "Point", a List of [longitude, latitude].
     * @param properties A Map of properties associated with the feature.
     * @return A Map representing a GeoJSON Feature.
     */
    private Map<String, Object> createGeoJsonFeature(String type, List<Double> coordinates, Map<String, Object> properties) {
        Map<String, Object> geometry = new HashMap<>();
        geometry.put("type", type);
        geometry.put("coordinates", coordinates);

        Map<String, Object> feature = new HashMap<>();
        feature.put("type", "Feature");
        feature.put("geometry", geometry);
        feature.put("properties", properties);

        return feature;
    }
}
