package com.wastecollect.backend.repository;

import com.wastecollect.common.models.Collector;
import com.wastecollect.common.models.Household;
import com.wastecollect.common.models.Municipality;
import com.wastecollect.common.utils.HousingType; // Import HousingType

import org.springframework.data.domain.Page; // Import Page
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime; // Import LocalDateTime
import java.util.List;
import java.util.Optional; // Import Optional for better practice with findById/findBy

@Repository
public interface HouseholdRepository extends JpaRepository<Household, Long> {

    // Find underserved areas based on the absence of collection preferences
    @Query("SELECT h FROM Household h WHERE h.collectionPreferences IS NULL OR h.collectionPreferences = ''")
    List<Household> findUnderservedAreas();

    @Query("SELECT h FROM Household h WHERE h.municipality.id = :municipalityId")
    List<Household> findByMunicipalityId(Long municipalityId);

    Optional<Household> findByEmail(String username);

    // Example: Find households served by a specific collector (if Household has a direct link or via ServiceRequest)
    // This example assumes a direct link, if not, you'd need a more complex query via ServiceRequest.
    // For now, this is a placeholder.
    @Query("SELECT COUNT(DISTINCT sr.household) FROM ServiceRequest sr WHERE sr.collector = :collector")
    long countByCollector(Collector collector);

    // If you need to fetch the actual Household objects served by a collector
    @Query("SELECT DISTINCT sr.household FROM ServiceRequest sr WHERE sr.collector = :collector")
    List<Household> findDistinctHouseholdsByCollector(Collector collector);

    // Changed to return Page for pagination
    Page<Household> findByMunicipality(Municipality municipality, Pageable pageable);

    long countByMunicipality(Municipality municipality);

    long countByMunicipalityAndIsActive(Municipality municipality, boolean b);

    // New: Count households where isActive is true
    long countByIsActiveTrue();

    // Corrected method: Count households where the last collection date is before a given threshold date
    // This replaces the problematic 'countByDaysSinceLastCollectionGreaterThan'
    long countByLastCollectionDateBefore(LocalDateTime thresholdDate);

    // Optional: Count households that have never had a collection recorded (lastCollectionDate is null)
    long countByLastCollectionDateIsNull();

    /**
     * Finds households by a list of user IDs.
     * This is useful when searching users by name/email and then filtering households by those user IDs.
     * @param ids A list of Household (User) IDs.
     * @param pageable Pagination information.
     * @return A Page of matching Households.
     */
    Page<Household> findByIdIn(List<Long> ids, Pageable pageable);

    /**
     * Finds households by their housing type.
     * @param housingType The HousingType enum to filter by.
     * @param pageable Pagination information.
     * @return A Page of matching Households.
     */
    Page<Household> findByHousingType(HousingType housingType, Pageable pageable);

    /**
     * Finds households by municipality and housing type.
     * @param municipality The Municipality object to filter by.
     * @param housingType The HousingType enum to filter by.
     * @param pageable Pagination information.
     * @return A Page of matching Households.
     */
    Page<Household> findByMunicipalityAndHousingType(Municipality municipality, HousingType housingType, Pageable pageable);

	Page<Household> findByIdInAndMunicipalityAndHousingType(List<Long> householdIds, Municipality municipality,
			HousingType housingType, Pageable pageable);

	Page<Household> findByIdInAndMunicipality(List<Long> householdIds, Municipality municipality, Pageable pageable);

	Page<Household> findByIdInAndHousingType(List<Long> householdIds, HousingType housingType, Pageable pageable);

	List<Household> findByMunicipality(Municipality municipality);
}
