package com.wastecollect.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.wastecollect.common.models.Collector;
import com.wastecollect.common.models.CollectorRating;
import com.wastecollect.common.models.Household;
import com.wastecollect.common.models.ServiceRequest;

public interface RatingRepository extends JpaRepository<CollectorRating, Long>{

    List<CollectorRating> findByServiceRequest(ServiceRequest serviceRequest);

    @Query("SELECT cr.serviceRequest.household FROM CollectorRating cr WHERE cr.serviceRequest.id = :serviceRequestId")
    Optional<Household> findHouseholdByServiceRequestId(Long serviceRequestId);

    @Query("SELECT cr FROM CollectorRating cr JOIN cr.serviceRequest sr WHERE sr.household.id = :householdId")
    List<CollectorRating> findByHouseholdId(Long householdId);

    List<CollectorRating> findByCollectorId(Long collectorId);

    // Removed the redundant method: Optional<Household> findByServiceRequestId(Long id);

    List<CollectorRating> findByCollector(Collector collector);
    long countByCollector(Collector collector);
    List<CollectorRating> findByCollectorOrderByRatingDateDesc(Collector collector);

    /**
     * Calculates the average rating for a specific collector.
     * @param collector The Collector entity.
     * @return The average rating, or 0.0 if no ratings found.
     */
    @Query("SELECT COALESCE(AVG(cr.overallRating), 0.0) FROM CollectorRating cr WHERE cr.collector = :collector")
    Double findAverageRatingByCollector(@Param("collector") Collector collector);
}
