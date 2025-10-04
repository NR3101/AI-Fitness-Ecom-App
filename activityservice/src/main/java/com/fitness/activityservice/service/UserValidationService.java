package com.fitness.activityservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
@RequiredArgsConstructor
public class UserValidationService {
    private final WebClient userServiceWebClient;

    public boolean isUserValid(String userId) {
        try {
            // Call the User Service to validate the user
            // Expecting a Boolean response
            return Boolean.TRUE.equals(userServiceWebClient.get()
                    .uri("/api/v1/users/{id}/validate", userId)
                    .retrieve()
                    .bodyToMono(Boolean.class) // Expecting a Boolean response
                    .block()); // Block to wait for the response
        } catch (WebClientResponseException e) {
            e.printStackTrace();
            return false; // If there's an error (e.g., 404), the user is not valid
        }
    }
}
