package com.wastecollect.backend.repository;

import com.wastecollect.common.models.Collector;
import com.wastecollect.common.models.Municipality;
import com.wastecollect.common.utils.CollectorStatus;

import java.util.Optional;

import org.springframework.data.domain.Page; // Import Page
import org.springframework.data.domain.Pageable; // Import Pageable
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CollectorRepository extends JpaRepository<Collector, Long> {

	Optional<Collector> findByEmail(String username);

	long countByMunicipality(Municipality municipality);

	long countByMunicipalityAndStatus(Municipality municipality, CollectorStatus active);
  	
    // New: Count collectors by their status
    long countByStatus(CollectorStatus status);

    /**
     * Finds collectors by first name, last name, or email containing a given string (case-insensitive).
     * Since Collector extends User, these fields are inherited from User.
     * @param firstName Search term for first name.
     * @param lastName Search term for last name.
     * @param email Search term for email.
     * @param pageable Pagination information.
     * @return A Page of matching Collectors.
     */
    Page<Collector> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
        String firstName, String lastName, String email, Pageable pageable);

    /**
     * Finds collectors by their status.
     * @param status The CollectorStatus enum to filter by.
     * @param pageable Pagination information.
     * @return A Page of matching Collectors.
     */
    Page<Collector> findByStatus(CollectorStatus status, Pageable pageable);

    /**
     * Finds collectors by their associated municipality.
     * @param municipality The Municipality object to filter by.
     * @param pageable Pagination information.
     * @return A Page of matching Collectors.
     */
    Page<Collector> findByMunicipality(Municipality municipality, Pageable pageable);

    /**
     * Finds collectors by municipality and status.
     * @param municipality The Municipality object to filter by.
     * @param status The CollectorStatus enum to filter by.
     * @param pageable Pagination information.
     * @return A Page of matching Collectors.
     */
    Page<Collector> findByMunicipalityAndStatus(Municipality municipality, CollectorStatus status, Pageable pageable);

    /**
     * Finds collectors by first name, last name, or email containing a given string
     * and by their municipality.
     * @param searchTermFirstName Search term for first name.
     * @param searchTermLastName Search term for last name.
     * @param searchTermEmail Search term for email.
     * @param municipality The Municipality object to filter by.
     * @param pageable Pagination information.
     * @return A Page of matching Collectors.
     */
    Page<Collector> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCaseAndMunicipality(
        String searchTermFirstName, String searchTermLastName, String searchTermEmail, Municipality municipality, Pageable pageable);

    /**
     * Finds collectors by first name, last name, or email containing a given string
     * and by their status.
     * @param searchTermFirstName Search term for first name.
     * @param searchTermLastName Search term for last name.
     * @param searchTermEmail Search term for email.
     * @param status The CollectorStatus enum to filter by.
     * @param pageable Pagination information.
     * @return A Page of matching Collectors.
     */
    Page<Collector> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCaseAndStatus(
        String searchTermFirstName, String searchTermLastName, String searchTermEmail, CollectorStatus status, Pageable pageable);

    /**
     * Finds collectors by first name, last name, or email containing a given string,
     * by their municipality, and by their status.
     * @param searchTermFirstName Search term for first name.
     * @param searchTermLastName Search term for last name.
     * @param searchTermEmail Search term for email.
     * @param municipality The Municipality object to filter by.
     * @param status The CollectorStatus enum to filter by.
     * @param pageable Pagination information.
     * @return A Page of matching Collectors.
     */
    Page<Collector> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCaseAndMunicipalityAndStatus(
        String searchTermFirstName, String searchTermLastName, String searchTermEmail, Municipality municipality, CollectorStatus status, Pageable pageable);
}
