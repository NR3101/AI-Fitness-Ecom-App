package com.fitness.aiservice.service;

import com.fitness.aiservice.exception.ResourceNotFoundException;
import com.fitness.aiservice.model.Recommendation;
import com.fitness.aiservice.repository.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationService {
    private final RecommendationRepository recommendationRepository;

    public List<Recommendation> getRecommendationsByUserId(String userId) {
        return recommendationRepository.findByUserId(userId);
    }

    public Recommendation getRecommendationByActivityId(String activityId) {
        return recommendationRepository.findByActivityId(activityId).
                orElseThrow(() -> new ResourceNotFoundException("Recommendation not found for activityId: " + activityId));
    }

    public Recommendation getRecommendationById(String recommendationId) {
        return recommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new ResourceNotFoundException("Recommendation not found with id: " + recommendationId));
    }

    public void deleteRecommendationByActivityId(String activityId) {
        recommendationRepository.findByActivityId(activityId)
                .ifPresent(recommendationRepository::delete);
    }
}
