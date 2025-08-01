package com.wastecollect.backend.repository;

import com.wastecollect.common.models.Collector;
import com.wastecollect.common.models.Household;
import com.wastecollect.common.models.Municipality;
import com.wastecollect.common.models.Payment; 
import com.wastecollect.common.models.ServiceRequest;
import com.wastecollect.common.utils.ServiceRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param; 
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {

	// Find service requests by status
    List<ServiceRequest> findByStatus(ServiceRequestStatus status);

    // Find service requests by collector and status
    List<ServiceRequest> findByCollectorAndStatus(Collector collector, ServiceRequestStatus status);

    // Count service requests by collector and status
    long countByCollectorAndStatus(Collector collector, ServiceRequestStatus status);

    // Find service requests by household
    List<ServiceRequest> findByHousehold(Household household);

    // Find service requests by household and status
    List<ServiceRequest> findByHouseholdAndStatus(Household household, ServiceRequestStatus status);

    // Find all service requests, potentially ordered by creation date or preferred date
    List<ServiceRequest> findAllByOrderByCreatedAtDesc();

    // Find service requests that are PENDING or ACCEPTED (for real-time view)
    List<ServiceRequest> findByStatusIn(List<ServiceRequestStatus> statuses);

    // Find by ID and ensure it belongs to a specific household (for security)
    Optional<ServiceRequest> findByIdAndHousehold(Long id, Household household);

    // Find by ID and ensure it is assigned to a specific collector (for security)
    Optional<ServiceRequest> findByIdAndCollector(Long id, Collector collector);

	long countByCollector(Collector collector);

	/**
     * Counts service requests for a collector with a specific status within a date range.
     * @param collector The collector.
     * @param status The status of the service request.
     * @param startDate The start date and time of the period.
     * @param endDate The end date and time of the period.
     * @return The count of matching service requests.
     */
	long countByCollectorAndStatusAndCreatedAtBetween(Collector collector, ServiceRequestStatus status,
			LocalDateTime startDate, LocalDateTime endDate);

	List<ServiceRequest> findByCollectorAndStatusIn(Collector collector, List<ServiceRequestStatus> statuses);

    /**
     * Counts service requests for a collector with a specific status created after a certain date.
     * Using @Query to explicitly define the query to avoid method name parsing issues.
     * @param collector The collector.
     * @param status The status of the service request.
     * @param createdAt The date and time after which the service requests were created.
     * @return The count of matching service requests.
     */
    @Query("SELECT COUNT(sr) FROM ServiceRequest sr WHERE sr.collector = :collector AND sr.status = :status AND sr.createdAt > :createdAt")
	long countByCollectorAndStatusAndCreatedAtAfter(@Param("collector") Collector collector, @Param("status") ServiceRequestStatus status, @Param("createdAt") LocalDateTime createdAt);

	long countDistinctHouseholdsByCollector(Collector collector); // This method is correct for counting

    /**
     * Counts all service requests created after a specific date.
     * @param dateTime The date and time from which to count.
     * @return The count of service requests.
     */
    long countByCreatedAtAfter(LocalDateTime dateTime);

    /**
     * Counts service requests with a specific status created after a certain date.
     * @param status The status of the service request.
     * @param dateTime The date and time from which to count.
     * @return The count of matching service requests.
     */
    long countByStatusAndCreatedAtAfter(ServiceRequestStatus status, LocalDateTime dateTime);

    /**
     * Finds the top 5 service requests with a specific status, ordered by updated date descending.
     * @param status The status to filter by (e.g., ServiceRequestStatus.COMPLETED).
     * @return A list of the top 5 matching ServiceRequest entities.
     */
    List<ServiceRequest> findTop5ByStatusOrderByUpdatedAtDesc(ServiceRequestStatus status);

	List<ServiceRequest> findByMunicipalityAndCreatedAtBetween(Municipality municipality, LocalDateTime startDate,
			LocalDateTime endDate);

	long countByHouseholdAndStatusIn(Household household, List<ServiceRequestStatus> of);

	List<ServiceRequest> findByMunicipalityAndStatusAndCreatedAtBetween(Municipality municipality,
			ServiceRequestStatus completed, LocalDateTime startDate, LocalDateTime endDate);

	long countByMunicipalityAndStatus(Municipality municipality, ServiceRequestStatus disputed);

    // Corrected query for average response time in hours.
    // Explicitly casting the TIMESTAMPDIFF result to DOUBLE to ensure it's numeric for AVG.
    @Query("SELECT AVG(CAST(FUNCTION('TIMESTAMPDIFF', HOUR, sr.createdAt, sr.updatedAt) AS double)) FROM ServiceRequest sr " +
           "WHERE sr.updatedAt IS NOT NULL AND sr.createdAt IS NOT NULL " +
           "AND sr.createdAt BETWEEN :startDate AND :endDate " +
           "AND sr.status = 'COMPLETED'")
    Double findAverageResponseTimeHours(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // This query correctly targets the 'WasteCollection' entity for average collector rating.
    // This query should ideally be in WasteCollectionRepository, but for now, it's adjusted to work from here
    // by explicitly querying the WasteCollection entity.
    @Query("SELECT AVG(wc.collectorRating) FROM WasteCollection wc WHERE wc.collectionDate BETWEEN :startDate AND :endDate AND wc.status = 'COMPLETED' AND wc.collectorRating IS NOT NULL")
    Double findAverageCollectionRating(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Removed the following methods as 'collectionDate' is not a property of ServiceRequest.
    // long countByStatusAndCollectionDateBetween(ServiceRequestStatus status, LocalDateTime startDate, LocalDateTime endDate);
    // List<ServiceRequest> findAllByCollectionDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Sum of estimated volume for service requests within a date range (using ServiceRequest's createdAt)
    @Query("SELECT COALESCE(SUM(sr.estimatedVolume), 0.0) FROM ServiceRequest sr WHERE sr.createdAt BETWEEN :startDate AND :endDate")
    Double sumEstimatedVolumeByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Sum of actual weight from WasteCollection entities (correctly targeting WasteCollection)
    @Query("SELECT COALESCE(SUM(wc.actualWeight), 0.0) FROM WasteCollection wc WHERE wc.collectionDate BETWEEN :startDate AND :endDate")
    Double sumActualWeightByCollectionDateBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Fetch service requests where waste type and estimated volume are available within a date range.
    @Query("SELECT sr FROM ServiceRequest sr WHERE sr.wasteType IS NOT NULL AND sr.estimatedVolume IS NOT NULL AND sr.createdAt BETWEEN :startDate AND :endDate")
    List<ServiceRequest> findByWasteTypeAndEstimatedVolumeAndCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

	Object countByStatus(ServiceRequestStatus pending);

	List<ServiceRequest> findByCreatedAtAfter(LocalDateTime oneMonthAgo);
}
