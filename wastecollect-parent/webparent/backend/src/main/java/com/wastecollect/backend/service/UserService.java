package com.wastecollect.backend.service;

import com.wastecollect.common.dto.*; // Update imports
import com.wastecollect.common.models.*;
import com.wastecollect.common.utils.RoleName;

import jakarta.validation.constraints.Email;

import com.wastecollect.backend.repository.MunicipalityRepository;
import com.wastecollect.backend.repository.PasswordResetTokenRepository;
import com.wastecollect.backend.repository.RoleRepository; // Import RoleRepository
import com.wastecollect.backend.repository.UserRepository;
import com.wastecollect.backend.exception.ResourceException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Import Transactional

import java.util.HashSet;
import java.util.Optional; // Import Optional
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService implements UserDetailsService{

	private final UserRepository userRepository;
    private final MunicipalityRepository municipalityRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, MunicipalityRepository municipalityRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.municipalityRepository = municipalityRepository;
		this.passwordResetTokenRepository = passwordResetTokenRepository;
		this.roleRepository = roleRepository;
		this.passwordEncoder = passwordEncoder;
	}

    @Transactional // Add transactional for write operation
    public void registerHousehold(HouseholdCreationDTO householdDto) { // Use HouseholdCreationDTO
        // Assuming you have a way to retrieve Municipality by name or ID
        // For example, if you have a MunicipalityRepository:
    	//Municipality municipality = municipalityRepository.findByMunicipalityName(householdDto.getArea())
        //        .orElseThrow(() -> new RuntimeException("Municipality not found: " + householdDto.getArea()));
    	
    	Municipality municipality = municipalityRepository.findByMunicipalityName(householdDto.getMunicipalityName())
    	        .orElseThrow(() -> new ResourceException("Municipality", "name", householdDto.getMunicipalityName()));
    	//newHousehold.setMunicipality(municipality);

        Household household = new Household(
                householdDto.getNumberOfMembers(),
                householdDto.getHousingType(),
                municipality // Pass the Municipality object here
        );
        household.setFirstName(householdDto.getFirstName());
        household.setLastName(householdDto.getLastName());
        household.setEmail(householdDto.getEmail());
        household.setPassword(passwordEncoder.encode(householdDto.getPassword())); // IMPORTANT: Hash password
        household.setPhoneNumber(householdDto.getPhoneNumber());
        household.setAddress(householdDto.getAddress());
        household.setCollectionPreferences(householdDto.getCollectionPreferences()); // Set collection preferences
        household.setLatitude(householdDto.getLatitude()); // Set latitude
        household.setLongitude(householdDto.getLongitude()); // Set longitude


        // Assign roles
        Role householdRoleEntity = roleRepository.findByName(RoleName.HOUSEHOLD)
                .orElseThrow(() -> new RuntimeException("Household role not found"));

        // Get the RoleName from the Role entity
        Set<Role> roles = new HashSet<>();
        roles.add(householdRoleEntity); // Add the Role entity
        household.setRoles(roles);

        userRepository.save(household);
        System.out.println("UserService DEBUG (Household - After Save): User ID: " + household.getId());

    }

    // Assuming this method handles self-registration for admin, distinct from AdminService's createAdmin
    @Transactional // Add transactional
    public void registerAdmin(AdminCreationDTO adminDto) { // Use AdminCreationDTO
        Admin admin = new Admin(
            adminDto.getFirstName(),
            adminDto.getLastName(),
            adminDto.getEmail(),
            passwordEncoder.encode(adminDto.getPassword()), // Hash password
            adminDto.getPhoneNumber(),
            adminDto.getAddress(),
            adminDto.getPosition(),
            adminDto.getManagementArea()
        );

        // Assign roles
        Role adminRoleEntity = roleRepository.findByName(RoleName.ADMIN)
                .orElseThrow(() -> new RuntimeException("Admin role not found"));
       
        Set<Role> roles = new HashSet<>();
	     roles.add(adminRoleEntity);

     // 4. Set the roles for the admin user
     admin.setRoles(roles);

        userRepository.save(admin);
        System.out.println("UserService DEBUG (Admin - After Save): User ID: " + admin.getId());
    }

    public UserDTO buildUserProfile(User user) {
        RoleName primaryRoleName = null;
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            // Assuming a user has at least one role, pick the first one for the DTO.
            // If a user can have multiple roles and you want to represent all,
            // UserDTO would need a Set<RoleName> or List<String> for roles.
            primaryRoleName = user.getRoles().iterator().next().getName(); // Get RoleName from Role entity
        }

        // Add logging here to see the values before DTO construction
        System.out.println("UserService DEBUG: Building UserProfile for email: " + user.getEmail());
        System.out.println("UserService DEBUG: User ID from database (in buildUserProfile): " + user.getId());
        System.out.println("UserService DEBUG: Primary RoleName from database (in buildUserProfile): " + primaryRoleName);


        return new UserDTO(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getAddress(),
                primaryRoleName // Pass the extracted RoleName
        );
    }
    
	/*
	 * public UserDTO buildUserProfile(User user) { if (user instanceof Household) {
	 * return new HouseholdDTO((Household) user); } else if (user instanceof
	 * Collector) { return new CollectorDTO((Collector) user); } else if (user
	 * instanceof Admin) { return new AdminDTO((Admin) user); } else if (user
	 * instanceof MunicipalManager) { return new
	 * MunicipalManagerProfileDTO((MunicipalManager) user); } throw new
	 * RuntimeException("Unknown user type"); }
	 */
    
    /**
     * Registers a new Collector user in the system.
     *
     * @param collectorDto The DTO containing the new collector's registration details.
     * @throws RuntimeException if the COLLECTOR role is not found in the database.
     */
    @Transactional // Add transactional for write operation
    public void registerCollector(CollectorCreationDTO collectorDto) {
        
    	// Retrieve the Municipality entity based on the provided municipalityName from the DTO
        Municipality municipality = municipalityRepository.findByMunicipalityName(collectorDto.getMunicipalityName())
                .orElseThrow(() -> new ResourceException("Municipality", "name", collectorDto.getMunicipalityName()));
        
    	// Create a new Collector entity from the DTO
        Collector collector = new Collector();
        collector.setFirstName(collectorDto.getFirstName());
        collector.setLastName(collectorDto.getLastName());
        collector.setEmail(collectorDto.getEmail());
        // Encode the password before saving it to the database for security
        collector.setPassword(passwordEncoder.encode(collectorDto.getPassword()));
        collector.setPhoneNumber(collectorDto.getPhoneNumber());
        collector.setAddress(collectorDto.getAddress());
        collector.setStatus(collectorDto.getStatus());
        
     // Set the Municipality for the collector
        collector.setMunicipality(municipality);
        
     // These lines ensure the fields are explicitly set, although defaults in User.java
        // constructor would also handle it if no specific overriding logic is needed.
        collector.setEnabled(true);
        collector.setAccountNonExpired(true);
        collector.setAccountNonLocked(true);
        collector.setCredentialsNonExpired(true);
        
        collector.setCollectorId(generateUniqueCollectorId());

        // Assign the COLLECTOR role to the new user
        Role collectorRoleEntity = roleRepository.findByName(RoleName.COLLECTOR)
                .orElseThrow(() -> new RuntimeException("Collector role not found"));

        // Create a new HashSet to hold the roles and add the collector role
        Set<Role> roles = new HashSet<>(); // Change Set<RoleName> to Set<Role>
        roles.add(collectorRoleEntity); // Add the Role entity to the set
        collector.setRoles(roles); // Set the roles for the collector user

        // Save the new collector user to the database
        userRepository.save(collector);
        System.out.println("UserService DEBUG (Collector - After Save): User ID: " + collector.getId());
    }
    
    private String generateUniqueCollectorId() {
        // Generates a random UUID and prefixes it for clarity.
        // This ensures a very high probability of uniqueness.
        return "COLL-" + UUID.randomUUID().toString();
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UsernameNotFoundException("No authenticated user found.");
        }
        // Get username (email) from the principal
        String username;
        if (authentication.getPrincipal() instanceof UserDetails) {
            username = ((UserDetails) authentication.getPrincipal()).getUsername();
        } else {
            // Fallback for other principal types if necessary, though UserDetails is typical
            username = authentication.getName(); // Get name from Authentication object
        }

        // Always re-fetch the user from the repository to ensure it's a fully managed entity with its ID
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Authenticated user not found in database: " + username));
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));

        // NEW LOG: Log the ID immediately after fetching by email
        System.out.println("UserService DEBUG: User ID after findByEmail in loadUserByUsername: " + user.getId());

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                user.isEnabled(),
                user.isAccountNonExpired(),
                user.isCredentialsNonExpired(),
                user.isAccountNonLocked(),
                user.getRoles().stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName())) // Ensure "ROLE_" prefix
                        .collect(Collectors.toList())
        );
    }

    @Transactional
    public void createPasswordResetTokenForUser(@Email(message = "Invalid email format") String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Invalidate any existing tokens for this user to ensure only one is active
        passwordResetTokenRepository.findByUser(user).ifPresent(passwordResetTokenRepository::delete);

        PasswordResetToken token = new PasswordResetToken(user);
        passwordResetTokenRepository.save(token);

        // TODO: Integrate with an EmailService to send the reset link to the user
        // Example: emailService.sendPasswordResetEmail(user.getEmail(), token.getToken());
        System.out.println("Password reset token generated for " + user.getEmail() + ": " + token.getToken()); // For debugging
    }
    
    @Transactional
    public void updatePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password does not match.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void resetPassword(String tokenString, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(tokenString)
                .orElseThrow(() -> new RuntimeException("Invalid password reset token.")); // Custom exception for invalid token

        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken); // Clean up expired token
            throw new RuntimeException("Password reset token has expired."); // Custom exception for expired token
        }

        User user = resetToken.getUser();
        if (user == null) {
            throw new RuntimeException("User associated with token not found."); // Should not happen if cascade is correct
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user); // Save the user with the new encoded password

        passwordResetTokenRepository.delete(resetToken); // Invalidate/delete the token after use
    }

	/**
	 * Finds a user by their email address.
	 * @param email The email address to search for.
	 * @return An Optional containing the User if found, or empty if not found.
	 */
	public Optional<User> findByEmail(String email) {
		return userRepository.findByEmail(email);
	}
}
