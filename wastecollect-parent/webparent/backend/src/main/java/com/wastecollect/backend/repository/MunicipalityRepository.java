package com.wastecollect.backend.repository;

import com.wastecollect.common.models.Municipality;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page; // Import Page
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface MunicipalityRepository extends JpaRepository<Municipality, Long> {
    // Assuming "current municipality" is the first enabled one
    @Query("SELECT m FROM Municipality m WHERE m.enabled = true ORDER BY m.id ASC LIMIT 1")
    Municipality findByCurrentMunicipality();
    
 // Option 1: Return a List and handle fetching the first in service layer
    @Query("SELECT m FROM Municipality m WHERE m.enabled = true ORDER BY m.id ASC")
    List<Municipality> findEnabledMunicipalitiesOrderedById(Pageable pageable);

    // Option 2: Find top 1 directly (more concise for single result)
    // Spring Data JPA can infer this without @Query
    Optional<Municipality> findTopByEnabledTrueOrderByIdAsc();
    
    /**
     * Finds a Municipality by its municipality name.
     * Spring Data JPA will automatically generate the query for this.
     *
     * @param municipalityName The name of the municipality to find.
     * @return An Optional containing the Municipality if found, or empty otherwise.
     */
    Optional<Municipality> findByMunicipalityName(String municipalityName);

    /**
     * Finds municipalities by name containing a given string (case-insensitive).
     * @param municipalityName The search term for the municipality name.
     * @param pageable Pagination information.
     * @return A Page of matching Municipalities.
     */
    Page<Municipality> findByMunicipalityNameContainingIgnoreCase(String municipalityName, Pageable pageable);

    /**
     * Finds municipalities by province containing a given string (case-insensitive).
     * @param province The search term for the province.
     * @param pageable Pagination information.
     * @return A Page of matching Municipalities.
     */
    Page<Municipality> findByProvinceContainingIgnoreCase(String province, Pageable pageable);

    /**
     * Finds municipalities by municipality name and province containing given strings (case-insensitive).
     * @param municipalityName The search term for the municipality name.
     * @param province The search term for the province.
     * @param pageable Pagination information.
     * @return A Page of matching Municipalities.
     */
    Page<Municipality> findByMunicipalityNameContainingIgnoreCaseAndProvinceContainingIgnoreCase(String municipalityName, String province, Pageable pageable);
}
