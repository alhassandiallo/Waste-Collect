package com.wastecollect.backend.controller;

import com.wastecollect.common.dto.*;
import com.wastecollect.common.models.User;
import com.wastecollect.backend.service.UserService;
import com.wastecollect.backend.dto.LoginRequest;
import com.wastecollect.backend.dto.ResetPasswordRequest;
import com.wastecollect.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    // Login method for all roles
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Get the UserDetails principal from the Authentication object
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();

        // Call the correct method: generateToken, and pass the UserDetails
        String jwt = jwtUtil.generateToken(userPrincipal);
        
        // Retrieve the full User entity from the UserService based on the authenticated email
        // This is crucial to get the User object (which contains roles and ID)
        User authenticatedUser = userService.findByEmail(userPrincipal.getUsername())
                                    .orElseThrow(() -> new RuntimeException("Authenticated user not found in DB after login."));

        // Build the UserDTO containing relevant user details, including the role and ID
        UserDTO userDto = userService.buildUserProfile(authenticatedUser);
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("tokenType", "Bearer");
        response.put("user", userDto); // Include the user object in the response
        
        return ResponseEntity.ok(response);
    }
    
    
    
    /**
     * Refreshes an expired JWT token by issuing a new one.
     * This method assumes the client sends the *current* access token in the Authorization header.
     * The backend will validate this token (even if expired, but valid in signature)
     * and issue a new one. This is a simplified refresh mechanism for an MVP.
     * For a more robust solution, consider implementing refresh tokens stored in the database.
     *
     * @param authorizationHeader The Authorization header containing the Bearer token.
     * @return ResponseEntity with a new JWT token and token type.
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid Authorization header.");
        }

        String oldToken = authorizationHeader.substring(7); // Extract token part
        
        try {
            // Validate the old token's signature and structure.
            // jwtUtil.validateToken will throw an exception if the token is invalid (e.g., malformed, bad signature).
            // It will also check for expiration, but we are specifically handling token expiration here
            // by allowing expired tokens to be refreshed if their signature is valid.
            String username = jwtUtil.extractUsername(oldToken);

            // Fetch user details to generate a new token
            UserDetails userDetails = userService.loadUserByUsername(username);

            // Generate a new token
            String newToken = jwtUtil.generateToken(userDetails);

            Map<String, String> response = new HashMap<>();
            response.put("token", newToken);
            response.put("tokenType", "Bearer");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Log the exception for debugging
            System.err.println("Error refreshing token: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token for refresh.");
        }
    }
    
    /**
     * Initiates the password reset process by sending a password reset token to the user's email.
     *
     * @param email The email address of the user requesting a password reset.
     * @return ResponseEntity indicating success or failure.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<String> requestPasswordReset(@RequestBody @Email(message = "Invalid email format") String email) {
        try {
            // Call UserService to handle the logic of generating a token and sending an email
            userService.createPasswordResetTokenForUser(email);
            return ResponseEntity.ok("Password reset link sent to your email.");
        } catch (RuntimeException e) {
            // Catch specific exceptions from UserService if needed (e.g., UserNotFoundException)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    /**
     * Resets the user's password using a valid password reset token.
     *
     * @param request Contains the reset token and the new password.
     * @return ResponseEntity indicating success or failure.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            // Call UserService to handle the logic of validating the token and updating the password
            userService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok("Password has been reset successfully.");
        } catch (RuntimeException e) {
            // Catch specific exceptions from UserService (e.g., InvalidTokenException, TokenExpiredException)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
    
    /**
     * Handles user logout. For stateless JWTs, this primarily serves as a client-side
     * acknowledgment and can optionally invalidate a refresh token if implemented.
     *
     * @return ResponseEntity with a success message.
     */
    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        // For stateless JWTs, server-side logout typically involves blacklisting the token
        // or invalidating a refresh token. For an MVP, we can simply acknowledge.
        // If you implement refresh tokens, this is where you'd invalidate the refresh token.
        // Example: userService.invalidateRefreshToken(SecurityContextHolder.getContext().getAuthentication().getName());
        
        SecurityContextHolder.clearContext(); // Clear Spring Security context (optional, as JWT is stateless)
        return ResponseEntity.ok("Logged out successfully.");
    }


    // Household registration
    @PostMapping("/register/household")
    public ResponseEntity<String> registerHousehold(@Valid @RequestBody HouseholdCreationDTO householdDto) {
        userService.registerHousehold(householdDto);
        return ResponseEntity.status(HttpStatus.CREATED).body("Household account created successfully");
    }

    // Collector registration
    @PostMapping("/register/collector")
    public ResponseEntity<String> registerCollector(@Valid @RequestBody CollectorCreationDTO collectorDto) {
        // Assuming userService.registerCollector expects a CollectorCreationDTO
        userService.registerCollector(collectorDto);
        return ResponseEntity.status(HttpStatus.CREATED).body("Collector account created successfully");
    }

    // Admin registration
    @PostMapping("/register/admin")
    public ResponseEntity<String> registerAdmin(@Valid @RequestBody AdminCreationDTO adminDto) {
        userService.registerAdmin(adminDto);
        return ResponseEntity.status(HttpStatus.CREATED).body("Admin account created successfully");
    }

    // Profile retrieval
    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile() {
        User currentUser = userService.getCurrentUser();
        return ResponseEntity.ok(userService.buildUserProfile(currentUser));
    }
}
