package com.wastecollect.backend.controller;

import com.wastecollect.backend.service.MunicipalManagerService;
import com.wastecollect.common.dto.MunicipalManagerCreationDTO;
import com.wastecollect.common.dto.MunicipalManagerProfileDTO;
import com.wastecollect.common.dto.MunicipalManagerUpdateDTO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // For role-based authorization
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for managing Municipal Manager accounts.
 * These endpoints are typically secured and accessible only by ADMINISTRATORS.
 */
@RestController
@RequestMapping("/api/v1/admin/municipal-managers") // Base path for admin-level management
public class MunicipalManagerController {

    private final MunicipalManagerService municipalManagerService;

    @Autowired
    public MunicipalManagerController(MunicipalManagerService municipalManagerService) {
        this.municipalManagerService = municipalManagerService;
    }

    /**
     * Creates a new Municipal Manager.
     * Accessible by ADMIN role.
     *
     * @param creationDTO The DTO containing the details for the new municipal manager.
     * @return A ResponseEntity with the created MunicipalManagerProfileDTO and HttpStatus.CREATED.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')") // Only ADMIN can create municipal managers
    public ResponseEntity<MunicipalManagerProfileDTO> createMunicipalManager(@Valid @RequestBody MunicipalManagerCreationDTO creationDTO) {
        MunicipalManagerProfileDTO newManager = municipalManagerService.createMunicipalManager(creationDTO);
        return new ResponseEntity<>(newManager, HttpStatus.CREATED);
    }

    /**
     * Retrieves a Municipal Manager by ID.
     * Accessible by ADMIN role.
     *
     * @param id The ID of the municipal manager to retrieve.
     * @return A ResponseEntity with the MunicipalManagerProfileDTO and HttpStatus.OK.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Only ADMIN can view municipal managers by ID
    public ResponseEntity<MunicipalManagerProfileDTO> getMunicipalManagerById(@PathVariable Long id) {
        MunicipalManagerProfileDTO manager = municipalManagerService.getMunicipalManagerById(id);
        return ResponseEntity.ok(manager);
    }

    /**
     * Retrieves a list of all Municipal Managers.
     * Accessible by ADMIN role.
     *
     * @return A ResponseEntity with a list of MunicipalManagerProfileDTOs and HttpStatus.OK.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')") // Only ADMIN can view all municipal managers
    public ResponseEntity<List<MunicipalManagerProfileDTO>> getAllMunicipalManagers() {
        List<MunicipalManagerProfileDTO> managers = municipalManagerService.getAllMunicipalManagers();
        return ResponseEntity.ok(managers);
    }

    /**
     * Updates an existing Municipal Manager.
     * Accessible by ADMIN role.
     *
     * @param id The ID of the municipal manager to update.
     * @param updateDTO The DTO containing the updated details.
     * @return A ResponseEntity with the updated MunicipalManagerProfileDTO and HttpStatus.OK.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Only ADMIN can update municipal managers
    public ResponseEntity<MunicipalManagerProfileDTO> updateMunicipalManager(@PathVariable Long id, @Valid @RequestBody MunicipalManagerUpdateDTO updateDTO) {
        MunicipalManagerProfileDTO updatedManager = municipalManagerService.updateMunicipalManager(id, updateDTO);
        return ResponseEntity.ok(updatedManager);
    }

    /**
     * Deletes a Municipal Manager by ID.
     * Accessible by ADMIN role.
     *
     * @param id The ID of the municipal manager to delete.
     * @return A ResponseEntity with HttpStatus.NO_CONTENT.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Only ADMIN can delete municipal managers
    public ResponseEntity<Void> deleteMunicipalManager(@PathVariable Long id) {
        municipalManagerService.deleteMunicipalManager(id);
        return ResponseEntity.noContent().build();
    }
}
