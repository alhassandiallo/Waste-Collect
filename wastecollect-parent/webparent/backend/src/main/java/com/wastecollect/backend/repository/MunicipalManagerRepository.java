package com.wastecollect.backend.repository;

import com.wastecollect.common.models.MunicipalManager;
import com.wastecollect.common.models.Municipality;
import com.wastecollect.common.models.Role;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for MunicipalManager entities.
 * Provides standard CRUD operations and custom query methods.
 */
@Repository
public interface MunicipalManagerRepository extends JpaRepository<MunicipalManager, Long> {

    /**
     * Finds a MunicipalManager by their email address.
     *
     * @param email The email address of the municipal manager.
     * @return An Optional containing the MunicipalManager if found, or empty otherwise.
     */
    Optional<MunicipalManager> findByEmail(String email);
    
 // Find managers by municipality ID
    List<MunicipalManager> findByMunicipalityId(Long municipalityId);

    // Custom method to delete managers by municipality ID (if you cascade deletion)
    @Modifying // For modifying operations like delete
    @Query("DELETE FROM MunicipalManager mm WHERE mm.municipality.id = :municipalityId")
    void deleteByMunicipalityId(@Param("municipalityId") Long municipalityId);

	// CORRECTED: Changed return type from Optional<Role> to Optional<MunicipalManager>
	Optional<MunicipalManager> findByMunicipality(Municipality municipality);
    
    //void deleteByMunicipalityId(Long municipalityId); 
}
