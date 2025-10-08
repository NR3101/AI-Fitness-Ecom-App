package com.fitness.aiservice.model;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "recommendations")
@Data
@Builder
public class Recommendation {
    @Id
    private String id;
    private String activityId;
    private String userId;
    private String type;
    private String recommendation;
    private List<String> improvements;
    private List<String> suggestions;
    private List<String> safetyTips;

    // Activity details for frontend display
    private String activityType;
    private String activityName;  // Custom activity name from additionalMetrics
    private Integer activityDuration;
    private Integer activityCalories;
    private Map<String, Object> activityMetrics;

    @CreatedDate
    private LocalDateTime createdAt;
}
