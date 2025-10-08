package com.fitness.userservice.service;

import com.fitness.userservice.dto.SyncUserRequest;
import com.fitness.userservice.dto.SignupRequest;
import com.fitness.userservice.dto.UserResponse;
import com.fitness.userservice.exception.BusinessException;
import com.fitness.userservice.exception.ResourceNotFoundException;
import com.fitness.userservice.models.User;
import com.fitness.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    private final KeycloakService keycloakService;

    /**
     * Map User entity to UserResponse DTO
     * Centralized mapping to avoid code duplication
     */
    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .keycloakId(user.getKeycloakId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public UserResponse syncUser(SyncUserRequest request) {
        // Check if user with the same email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            User existingUser = userRepository.findByEmail(request.getEmail());
            
            // Update keycloakId if it's different (user re-registered with same email)
            if (request.getKeycloakId() != null && !request.getKeycloakId().equals(existingUser.getKeycloakId())) {
                existingUser.setKeycloakId(request.getKeycloakId());
                existingUser.setFirstName(request.getFirstName());
                existingUser.setLastName(request.getLastName());
                existingUser = userRepository.save(existingUser);
            }
            
            return mapToUserResponse(existingUser);
        }

        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setKeycloakId(request.getKeycloakId());
        user.setPassword(request.getPassword());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        User savedUser = userRepository.save(user);
        return mapToUserResponse(savedUser);
    }

    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToUserResponse(user);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToUserResponse)
                .toList();
    }

    public Boolean existsByUserId(String id) {
        return userRepository.existsByKeycloakId(id);
    }
    
    public UserResponse getUserByKeycloakId(String keycloakId) {
        User user = userRepository.findByKeycloakId(keycloakId);
        if (user == null) {
            throw new ResourceNotFoundException("User not found with keycloakId: " + keycloakId);
        }
        return mapToUserResponse(user);
    }
    
    /**
     * Signup - Create user in both Keycloak and local database
     */
    public UserResponse signup(SignupRequest request) {
        log.info("Processing signup for email: {}", request.getEmail());
        
        // Check if user already exists in local database
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("User already exists with email: " + request.getEmail());
        }
        
        // Check if user exists in Keycloak
        if (keycloakService.userExists(request.getEmail())) {
            throw new BusinessException("User already exists in Keycloak with email: " + request.getEmail());
        }
        
        try {
            // Create user in Keycloak first
            String keycloakId = keycloakService.createUser(
                request.getEmail(),
                request.getPassword(),
                request.getFirstName(),
                request.getLastName()
            );
            
            log.info("User created in Keycloak with ID: {}", keycloakId);
            
            // Save user in local database
            User user = new User();
            user.setEmail(request.getEmail());
            user.setKeycloakId(keycloakId);
            user.setPassword(request.getPassword());
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            
            User savedUser = userRepository.save(user);
            log.info("User saved in database with ID: {}", savedUser.getId());
            
            return mapToUserResponse(savedUser);
                    
        } catch (Exception e) {
            log.error("Error during signup: {}", e.getMessage(), e);
            throw new BusinessException("Failed to create user: " + e.getMessage());
        }
    }
}
