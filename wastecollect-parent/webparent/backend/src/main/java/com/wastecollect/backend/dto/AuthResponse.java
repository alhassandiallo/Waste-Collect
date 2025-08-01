package com.wastecollect.backend.dto;

import com.wastecollect.common.utils.RoleName;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) for authentication response.
 * Contains the JWT token, user ID, email, role, and token expiration information.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private Long id;
    private String email;
    private RoleName role;
    private String type = "Bearer"; // Token type

    // New field to indicate token expiration time (e.g., in milliseconds from epoch)
    private Long expiresIn; // Time in milliseconds until the token expires

    // You might want to update the AllArgsConstructor if you add this field
    // However, Lombok's @AllArgsConstructor will automatically include it.
    // If you need a specific constructor, you can define it manually or use a builder pattern.
    // For simplicity, we'll rely on Lombok.
}