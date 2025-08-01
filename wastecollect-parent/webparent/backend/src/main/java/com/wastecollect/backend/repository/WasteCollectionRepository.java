package com.wastecollect.backend.repository;

import com.wastecollect.common.models.Household;
import com.wastecollect.common.models.Municipality;
import com.wastecollect.common.models.WasteCollection;
import com.wastecollect.common.utils.ServiceRequestStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WasteCollectionRepository extends JpaRepository<WasteCollection, Long> {

	// Find collections by household ID (already derived)
    List<WasteCollection> findByHousehold_Id(Long householdId);

    // Find collections by municipality ID (now derived) - keeping this derived
    List<WasteCollection> findByMunicipality_Id(Long municipalityId);

    // Find collections by date range (now derived)
    List<WasteCollection> findByCollectionDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Keeping one clear derived query for status not
    List<WasteCollection> findByHouseholdAndStatusNot(Household household, ServiceRequestStatus status);

	List<WasteCollection> findByMunicipalityAndCollectionDateBetween(Municipality municipality, LocalDateTime startDate,
			LocalDateTime endDate);

	Optional<WasteCollection> findTopByHouseholdAndMunicipalityOrderByCollectionDateDesc(Household household,
			Municipality municipality);

	long countByCollectionDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Removed redundant: @Query("SELECT wc FROM WasteCollection wc WHERE wc.municipality.id = :municipalityId")
    // List<WasteCollection> findByMunicipalityId(Long municipalityId);

    // Removed redundant: List<WasteCollection> findByHouseholdAndServiceRequestStatusNot(Household household, ServiceRequestStatus status);
}
