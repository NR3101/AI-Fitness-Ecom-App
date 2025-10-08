package com.fitness.userservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO for syncing existing Keycloak users to the local database.
 * This is used when a user already exists in Keycloak (authenticated via JWT)
 * and needs to be registered in the local database.
 * 
 * Used by: Gateway's KeycloakUserSyncFilter for automatic user synchronization
 * Endpoint: POST /api/v1/users/sync
 * 
 * Note: This does NOT create users in Keycloak. Use SignupRequest for new user creation.
 */
@Data
public class SyncUserRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    private String keycloakId;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    @NotBlank(message = "First name is required")
    private String firstName;
    @NotBlank(message = "Last name is required")
    private String lastName;
}
