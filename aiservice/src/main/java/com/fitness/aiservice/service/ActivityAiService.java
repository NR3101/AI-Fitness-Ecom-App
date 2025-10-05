package com.fitness.aiservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitness.aiservice.model.Activity;
import com.fitness.aiservice.model.Recommendation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ActivityAiService {
    private final GeminiService geminiService;

    public Recommendation generateRecommendations(Activity activity) {
        String prompt = createPromptForActivity(activity);
        String aiResponse = geminiService.getRecommendations(prompt);
//        log.info("Reponse from Gemini: {}", aiResponse);

        return processAIResponse(activity, aiResponse);
    }

    private Recommendation processAIResponse(Activity activity, String aiResponse) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(aiResponse);
            JsonNode textNode = rootNode
                    .path("candidates")
                    .get(0)
                    .path("content")
                    .get("parts")
                    .get(0)
                    .path("text");

            String jsonContent = textNode.asText()
                    .replaceAll("```json\\n", "")
                    .replaceAll("\\n```", "")
                    .trim();

            log.info("Cleaned JSON content: {}", jsonContent);

            JsonNode analysisJson = objectMapper.readTree(jsonContent);
            JsonNode analysisNode = analysisJson.path("analysis");
            StringBuilder fullAnalysis = new StringBuilder();
            addAnalysisSection(fullAnalysis, analysisNode, "overall", "Overall:");
            addAnalysisSection(fullAnalysis, analysisNode, "pace", "Pace:");
            addAnalysisSection(fullAnalysis, analysisNode, "heartRate", "Heart Rate:");
            addAnalysisSection(fullAnalysis, analysisNode, "caloriesBurned", "Calories Burned:");

            List<String> improvements = extractImprovements(analysisJson.path("improvements"));
            List<String> suggestions = extractSuggestions(analysisJson.path("suggestions"));
            List<String> safety = extractSafety(analysisJson.path("safety"));

            return Recommendation
                    .builder()
                    .activityId(activity.getId())
                    .userId(activity.getUserId())
                    .type(activity.getType().toString())
                    .recommendation(fullAnalysis.toString().trim())
                    .improvements(improvements)
                    .suggestions(suggestions)
                    .safetyTips(safety)
                    .createdAt(LocalDateTime.now())
                    .build();

        } catch (Exception e) {
            e.printStackTrace();
            return createDefaultRecommendation(activity);
        }
    }

    private Recommendation createDefaultRecommendation(Activity activity) {
        return Recommendation
                .builder()
                .activityId(activity.getId())
                .userId(activity.getUserId())
                .type(activity.getType().toString())
                .recommendation("Unable to generate recommendations at this time.")
                .improvements(Collections.singletonList("No specific improvements provided."))
                .suggestions(Collections.singletonList("No specific workout provided."))
                .safetyTips(Collections.singletonList("No specific safety recommendations provided."))
                .createdAt(LocalDateTime.now())
                .build();
    }

    private List<String> extractImprovements(JsonNode improvementsNode) {
        List<String> improvements = new ArrayList<>();
        if (improvementsNode.isArray()) {
            improvementsNode.forEach(improvementNode -> {
                String area = improvementNode.path("area").asText();
                String recommendation = improvementNode.path("recommendation").asText();
                improvements.add(String.format("%s: %s", area, recommendation));
            });
        }
        return improvements.isEmpty()
                ? Collections.singletonList("No specific improvements provided.")
                : improvements;
    }

    private List<String> extractSuggestions(JsonNode suggestionsNode) {
        List<String> suggestions = new ArrayList<>();
        if (suggestionsNode.isArray()) {
            suggestionsNode.forEach(suggestionNode -> {
                String workout = suggestionNode.path("workout").asText();
                String description = suggestionNode.path("description").asText();
                suggestions.add(String.format("%s: %s", workout, description));
            });
        }
        return suggestions.isEmpty()
                ? Collections.singletonList("No specific workout provided.")
                : suggestions;
    }

    private List<String> extractSafety(JsonNode safetyNode) {
        List<String> safety = new ArrayList<>();
        if (safetyNode.isArray()) {
            safetyNode.forEach(safetyPoint -> safety.add(safetyPoint.asText()));
        }
        return safety.isEmpty()
                ? Collections.singletonList("No specific safety recommendations provided.")
                : safety;
    }

    // Converts this format: "overall": "text" to this format: "Overall: text"
    private void addAnalysisSection(StringBuilder fullAnalysis, JsonNode analysisNode, String key, String prefix) {
        if (!analysisNode.path(key).isMissingNode()) {
            fullAnalysis.append(prefix)
                    .append(analysisNode.path(key).asText())
                    .append("\n\n");
        }
    }


    private String createPromptForActivity(Activity activity) {
        return String.format("""
                        You are a certified fitness coach and exercise physiologist. Analyze this fitness activity and provide detailed, evidence-based recommendations.
                        
                        STRICT REQUIREMENTS:
                        1. Respond ONLY with valid JSON - no markdown, no explanations outside the JSON
                        2. Use the EXACT structure provided below
                        3. Base recommendations on scientific fitness principles
                        4. Consider the user's current fitness level and activity type
                        5. Provide specific, actionable advice with measurable targets
                        
                        ACTIVITY DATA:
                        - Type: %s
                        - Duration: %d minutes
                        - Calories Burned: %d kcal
                        - Metrics: %s
                        
                        REQUIRED JSON FORMAT:
                        {
                          "analysis": {
                            "overall": "Comprehensive assessment of performance relative to activity type and duration. Include whether intensity was appropriate.",
                            "pace": "Evaluate pacing strategy. Was it consistent? Too fast/slow? Compare to recommended ranges for this activity type.",
                            "heartRate": "Analyze cardiovascular response if HR data available. Otherwise, estimate intensity based on duration and calories. Comment on aerobic/anaerobic zones.",
                            "caloriesBurned": "Assess if caloric expenditure aligns with activity type, duration, and typical metabolic demands. Note efficiency."
                          },
                          "improvements": [
                            {
                              "area": "Specific performance metric (e.g., 'Pacing Strategy', 'Endurance', 'Intensity Management')",
                              "recommendation": "Detailed, actionable advice with specific targets or methods (e.g., 'Increase weekly mileage by 10%% using the 80/20 rule')"
                            }
                          ],
                          "suggestions": [
                            {
                              "workout": "Specific workout name (e.g., 'Interval Training', 'Recovery Run', 'Strength Circuit')",
                              "description": "Complete workout prescription including: duration, intensity level, sets/reps if applicable, and expected benefits"
                            }
                          ],
                          "safety": [
                            "Specific precaution or warning relevant to this activity type and intensity level",
                            "Recovery recommendations including rest days and cross-training options"
                          ]
                        }
                        
                        GUIDELINES FOR EACH SECTION:
                        - Analysis: Be specific about what went well and what needs improvement
                        - Improvements: Prioritize 2-3 most impactful areas with concrete steps
                        - Suggestions: Recommend 2-3 complementary workouts that address identified gaps
                        - Safety: Include injury prevention, recovery needs, and signs of overtraining
                        
                        Ensure the response follows the EXACT JSON format shown above.
                        Generate response now (JSON only):
                        """,
                activity.getType(),
                activity.getDuration(),
                activity.getCaloriesBurned(),
                activity.getAdditionalMetrics()
        );
    }


//    private String createPromptForActivity(Activity activity) {
//        return String.format("""
//                        Analyze this fitness activity and provide detailed recommendations in the following EXACT JSON format:
//                        {
//                          "analysis": {
//                            "overall": "Overall analysis here",
//                            "pace": "Pace analysis here",
//                            "heartRate": "Heart rate analysis here",
//                            "caloriesBurned": "Calories analysis here"
//                          },
//                          "improvements": [
//                            {
//                              "area": "Area name",
//                              "recommendation": "Detailed recommendation"
//                            }
//                          ],
//                          "suggestions": [
//                            {
//                              "workout": "Workout name",
//                              "description": "Detailed workout description"
//                            }
//                          ],
//                          "safety": [
//                            "Safety point 1",
//                            "Safety point 2"
//                          ]
//                        }
//
//                        Analyze this activity:
//                        Activity Type: %s
//                        Duration: %d minutes
//                        Calories Burned: %d
//                        Additional Metrics: %s
//
//                        Provide detailed analysis focusing on performance, improvements, next workout suggestions, and safety guidelines.
//                        Ensure the response follows the EXACT JSON format shown above.
//                        """,
//                activity.getType(),
//                activity.getDuration(),
//                activity.getCaloriesBurned(),
//                activity.getAdditionalMetrics()
//        );
//    }
}
