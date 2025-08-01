package com.wastecollect.backend.service;

import com.wastecollect.backend.exception.ResourceException;
import com.wastecollect.backend.repository.MunicipalManagerRepository;
import com.wastecollect.backend.repository.MunicipalityRepository;
import com.wastecollect.backend.repository.RoleRepository;
import com.wastecollect.common.dto.MunicipalManagerCreationDTO;
import com.wastecollect.common.dto.MunicipalManagerProfileDTO;
import com.wastecollect.common.dto.MunicipalManagerUpdateDTO;
import com.wastecollect.common.models.MunicipalManager;
import com.wastecollect.common.models.Municipality;
import com.wastecollect.common.models.Role;
import com.wastecollect.common.utils.RoleName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service class for managing Municipal Manager entities.
 * Provides methods for creating, updating, deleting, and retrieving municipal managers.
 * These operations are intended to be performed by an Administrator.
 */
@Service
public class MunicipalManagerService {

    private final MunicipalManagerRepository municipalManagerRepository;
    private final MunicipalityRepository municipalityRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public MunicipalManagerService(MunicipalManagerRepository municipalManagerRepository,
                                   MunicipalityRepository municipalityRepository,
                                   RoleRepository roleRepository,
                                   PasswordEncoder passwordEncoder) {
        this.municipalManagerRepository = municipalManagerRepository;
        this.municipalityRepository = municipalityRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Creates a new Municipal Manager account.
     *
     * @param creationDTO The DTO containing the new municipal manager's details.
     * @return The profile DTO of the newly created municipal manager.
     * @throws ResourceException if the specified Municipality or Role is not found.
     */
    @Transactional
    public MunicipalManagerProfileDTO createMunicipalManager(MunicipalManagerCreationDTO creationDTO) {
        // Check if a user with the given email already exists
        if (municipalManagerRepository.findByEmail(creationDTO.getEmail()).isPresent()) {
            throw new IllegalArgumentException("User with this email already exists: " + creationDTO.getEmail());
        }

        // Find the Municipality by ID
        Municipality municipality = municipalityRepository.findById(creationDTO.getMunicipalityId())
                .orElseThrow(() -> new ResourceException("Municipality", "id", creationDTO.getMunicipalityId().toString()));

        // Create the MunicipalManager entity
        MunicipalManager municipalManager = new MunicipalManager();
        municipalManager.setFirstName(creationDTO.getFirstName());
        municipalManager.setLastName(creationDTO.getLastName());
        municipalManager.setEmail(creationDTO.getEmail());
        municipalManager.setPassword(passwordEncoder.encode(creationDTO.getPassword())); // Encode password
        municipalManager.setPhoneNumber(creationDTO.getPhoneNumber());
        municipalManager.setAddress(creationDTO.getAddress());
        municipalManager.setMunicipality(municipality);

        // Assign the MUNICIPAL_MANAGER role
        Role municipalManagerRoleEntity = roleRepository.findByName(RoleName.MUNICIPAL_MANAGER)
        	    .orElseThrow(() -> new ResourceException("Role", "name", RoleName.MUNICIPAL_MANAGER.name()));

        	Set<Role> roles = new HashSet<>();
        	roles.add(municipalManagerRoleEntity);
        	municipalManager.setRoles(roles);

        MunicipalManager savedManager = municipalManagerRepository.save(municipalManager);
        return convertToProfileDTO(savedManager);
    }

    /**
     * Retrieves a Municipal Manager by their ID.
     *
     * @param id The ID of the municipal manager.
     * @return The profile DTO of the municipal manager.
     * @throws ResourceException if the municipal manager is not found.
     */
    @Transactional(readOnly = true)
    public MunicipalManagerProfileDTO getMunicipalManagerById(Long id) {
        MunicipalManager municipalManager = municipalManagerRepository.findById(id)
                .orElseThrow(() -> new ResourceException("MunicipalManager", "id", id.toString()));
        return convertToProfileDTO(municipalManager);
    }

    /**
     * Retrieves all Municipal Managers.
     *
     * @return A list of profile DTOs for all municipal managers.
     */
    @Transactional(readOnly = true)
    public List<MunicipalManagerProfileDTO> getAllMunicipalManagers() {
        return municipalManagerRepository.findAll().stream()
                .map(this::convertToProfileDTO)
                .collect(Collectors.toList());
    }

    /**
     * Updates an existing Municipal Manager's details.
     *
     * @param id The ID of the municipal manager to update.
     * @param updateDTO The DTO containing the updated details.
     * @return The profile DTO of the updated municipal manager.
     * @throws ResourceException if the municipal manager or municipality is not found.
     */
    @Transactional
    public MunicipalManagerProfileDTO updateMunicipalManager(Long id, MunicipalManagerUpdateDTO updateDTO) {
        MunicipalManager existingManager = municipalManagerRepository.findById(id)
                .orElseThrow(() -> new ResourceException("MunicipalManager", "id", id.toString()));

        // Check if email is being changed to an email already in use by another user
        if (!existingManager.getEmail().equals(updateDTO.getEmail()) &&
            municipalManagerRepository.findByEmail(updateDTO.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use by another user: " + updateDTO.getEmail());
        }

        Municipality municipality = municipalityRepository.findById(updateDTO.getMunicipalityId())
                .orElseThrow(() -> new ResourceException("Municipality", "id", updateDTO.getMunicipalityId().toString()));

        existingManager.setFirstName(updateDTO.getFirstName());
        existingManager.setLastName(updateDTO.getLastName());
        existingManager.setEmail(updateDTO.getEmail());
        existingManager.setPhoneNumber(updateDTO.getPhoneNumber());
        existingManager.setAddress(updateDTO.getAddress());
        existingManager.setMunicipality(municipality);

        MunicipalManager updatedManager = municipalManagerRepository.save(existingManager);
        return convertToProfileDTO(updatedManager);
    }

    /**
     * Deletes a Municipal Manager by their ID.
     *
     * @param id The ID of the municipal manager to delete.
     * @throws ResourceException if the municipal manager is not found.
     */
    @Transactional
    public void deleteMunicipalManager(Long id) {
        if (!municipalManagerRepository.existsById(id)) {
            throw new ResourceException("MunicipalManager", "id", id.toString());
        }
        municipalManagerRepository.deleteById(id);
    }

    /**
     * Converts a MunicipalManager entity to a MunicipalManagerProfileDTO.
     *
     * @param municipalManager The MunicipalManager entity.
     * @return The corresponding MunicipalManagerProfileDTO.
     */
    private MunicipalManagerProfileDTO convertToProfileDTO(MunicipalManager municipalManager) {
        String municipalityName = (municipalManager.getMunicipality() != null) ?
                                   municipalManager.getMunicipality().getMunicipalityName() : null; // Corrected: getMunicipalityName()
        Long municipalityId = (municipalManager.getMunicipality() != null) ?
                                  municipalManager.getMunicipality().getId() : null;

        return new MunicipalManagerProfileDTO(
                municipalManager.getId(),
                municipalManager.getFirstName(),
                municipalManager.getLastName(),
                municipalManager.getEmail(),
                municipalManager.getPhoneNumber(),
                municipalManager.getAddress(),
                municipalityId,
                municipalityName
        );
    }
}
