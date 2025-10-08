package com.fitness.userservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating new users in both Keycloak and the local database.
 * This is used when a new user signs up from the frontend.
 * 
 * Process:
 * 1. Creates user in Keycloak (generates keycloakId)
 * 2. Saves user to local database with the generated keycloakId
 * 
 * Used by: Frontend SignupPage for new user registration
 * Endpoint: POST /api/v1/users/signup
 * 
 * Note: This CREATES users in Keycloak. Use SyncUserRequest to sync existing Keycloak users.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;
}
