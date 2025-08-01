package com.wastecollect.backend.service.report;

import com.wastecollect.backend.repository.ServiceRequestRepository;
import com.wastecollect.common.models.ServiceRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for predictive analysis related to waste collection.
 * NOTE: The logic here is a simplified simulation for demonstration purposes.
 * A real-world implementation would involve complex data science models,
 * potentially leveraging machine learning, and might be implemented as a
 * separate microservice for scalability and specialized processing.
 */
@Service
public class PredictiveAnalysisService {

    private final ServiceRequestRepository serviceRequestRepository;

    /**
     * Constructs a PredictiveAnalysisService with the necessary repository.
     * @param serviceRequestRepository Repository for ServiceRequest entities.
     */
    public PredictiveAnalysisService(ServiceRequestRepository serviceRequestRepository) {
        this.serviceRequestRepository = serviceRequestRepository;
    }

    /**
     * Performs a predictive analysis for waste management, including:
     * 1. Predicting next week's waste volume.
     * 2. Identifying high-demand areas.
     * 3. Suggesting (mocked) optimal collection routes.
     *
     * @param config A map for configuration parameters. Can be extended to
     * allow dynamic adjustment of prediction periods, etc.
     * @return A Map containing the results of the predictive analysis.
     */
    public Map<String, Object> getWastePredictionAnalysis(Map<String, Object> config) {
        Map<String, Object> analysisResult = new HashMap<>();

        // 1. Predict next week's waste volume (simple historical average)
        // This prediction is based on the average actual weight collected over the last 4 weeks.
        double prediction = predictNextWeekVolume();
        analysisResult.put("nextWeekWasteVolumePrediction", prediction);

        // 2. Identify high-demand areas (based on last month's service requests)
        // These are municipalities with the highest number of service requests.
        List<String> highDemandAreas = findHighDemandAreas();
        analysisResult.put("highDemandAreas", highDemandAreas);

        // 3. Suggest optimal routes (currently mocked)
        // In a real application, this would involve a complex Vehicle Routing Problem (VRP)
        // optimization engine, considering factors like traffic, collector capacity,
        // and service request locations.
        analysisResult.put("optimalCollectorRoutes", Arrays.asList(
            "Route Alpha: Collector 1 -> Households [A, B, C]",
            "Route Bravo: Collector 2 -> Households [D, E, F]",
            "Route Charlie: Collector 3 -> Households [G, H, I]" // Added one more for illustrative purposes
        ));

        return analysisResult;
    }

    /**
     * Predicts the total waste volume for the next week based on the average
     * actual weight collected in completed service requests over the past four weeks.
     * Assumes actual weight data is associated with 'WasteCollection' entities
     * which are linked to completed service requests.
     *
     * @return The predicted weekly waste volume in a double format.
     */
    private double predictNextWeekVolume() {
        // Define the time window for historical data: last 4 weeks
        LocalDateTime fourWeeksAgo = LocalDateTime.now().minusWeeks(4);
        LocalDateTime now = LocalDateTime.now();

        // Use the repository method to sum actual weights from WasteCollection entities
        // whose collection date falls within the last 4 weeks.
        Double totalWeight = serviceRequestRepository.sumActualWeightByCollectionDateBetween(fourWeeksAgo, now);

        // Handle null case for totalWeight (if no data found)
        if (totalWeight == null) {
            totalWeight = 0.0;
        }

        // Return the weekly average. Divide by 4 (weeks) to get the average weekly volume.
        return totalWeight / 4.0;
    }

    /**
     * Identifies the top 3 high-demand areas (municipalities) based on the
     * number of service requests created in the last month.
     *
     * @return A list of municipality names representing the high-demand areas.
     */
    private List<String> findHighDemandAreas() {
        // Define the time window for recent requests: last month
        LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);

        // Fetch all service requests created after 'oneMonthAgo'
        // Note: For very large datasets, consider a more targeted query if available,
        // e.g., finding distinct municipalities with counts directly in the database.
        List<ServiceRequest> recentRequests = serviceRequestRepository.findByCreatedAtAfter(oneMonthAgo);

        // Group requests by municipality name and count them, then sort to find top 3
        return recentRequests.stream()
            // Filter out requests without a household or municipality assigned
            .filter(req -> req.getHousehold() != null && req.getHousehold().getMunicipality() != null)
            // Group by municipality name and count occurrences
            .collect(Collectors.groupingBy(
                req -> req.getHousehold().getMunicipality().getMunicipalityName(),
                Collectors.counting()
            ))
            // Convert to a stream of Map entries
            .entrySet().stream()
            // Sort entries in descending order based on the count (value)
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            // Limit to the top 3 high-demand areas
            .limit(3)
            // Map back to just the municipality names
            .map(Map.Entry::getKey)
            // Collect the results into a List
            .collect(Collectors.toList());
    }
}
