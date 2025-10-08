package com.fitness.activityservice.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

@Component
@RequiredArgsConstructor
@Slf4j
public class RecommendationClient {

    private final RestTemplate restTemplate;

    @Value("${ai.service.url:http://AI-SERVICE}")
    private String aiServiceUrl;

    public void deleteRecommendationByActivityId(String activityId) {
        try {
            String url = aiServiceUrl + "/api/v1/recommendations/activity/" + activityId;
            restTemplate.delete(url);
            log.info("Successfully deleted recommendation for activity: {}", activityId);
        } catch (RestClientException e) {
            // Log error but don't fail the activity deletion
            log.error("Failed to delete recommendation for activity: {}. Error: {}", activityId, e.getMessage());
        }
    }
}
