import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Lightbulb,
  AlertTriangle,
  Calendar,
  Activity,
  Clock,
  Flame,
} from "lucide-react";
import Card from "@/components/common/Card.jsx";
import Button from "@/components/common/Button.jsx";
import LoadingSpinner from "@/components/common/LoadingSpinner.jsx";
import Alert from "@/components/common/Alert.jsx";
import { recommendationService } from "@/api/recommendationService.js";
import { getActivityTypeLabel } from "@/api/activityService.js";
import { formatDate } from "@/utils/helpers.js";

/**
 * Remove prefixes like "Overall:" from recommendation text
 */
const cleanRecommendationText = (text) => {
  if (!text) return "No overall recommendation available";

  // Remove common prefixes
  const prefixes = [
    /^Overall:\s*/i,
    /^Overall Assessment:\s*/i,
    /^Assessment:\s*/i,
  ];

  let cleanedText = text;
  prefixes.forEach((prefix) => {
    cleanedText = cleanedText.replace(prefix, "");
  });

  return cleanedText.trim() || "No overall recommendation available";
};

/**
 * Recommendation Details Page
 * Display detailed view of a single AI recommendation
 */
const RecommendationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRecommendation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await recommendationService.getRecommendationById(id);
      setRecommendation(data.data || data);
    } catch (err) {
      setError(err.message || "Failed to load recommendation");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadRecommendation();
    }
  }, [id, loadRecommendation]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="text-gray-600 mt-4">
            Loading recommendation details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button
          variant="secondary"
          onClick={() => navigate("/recommendations")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Recommendations
        </Button>
        <Alert type="error" message={error} />
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="space-y-4">
        <Button
          variant="secondary"
          onClick={() => navigate("/recommendations")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Recommendations
        </Button>
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600">Recommendation not found</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Button
        variant="secondary"
        onClick={() => navigate("/recommendations")}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to All Recommendations
      </Button>

      {/* Header Card */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Sparkles className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {recommendation.activityName ||
                    getActivityTypeLabel(recommendation.activityType) ||
                    "AI Insight"}
                </h1>
                <p className="text-purple-100 text-sm mt-1">
                  Personalized recommendation based on your activity
                </p>
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-purple-100">
            <div className="flex items-center gap-2 justify-end mb-1">
              <Calendar className="h-4 w-4" />
              {formatDate(recommendation.createdAt)}
            </div>
          </div>
        </div>
      </Card>

      {/* Activity Summary (if available) */}
      {(recommendation.activityDuration || recommendation.activityCalories) && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Activity Summary
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {recommendation.activityDuration && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-xl font-bold text-gray-900">
                    {recommendation.activityDuration} min
                  </p>
                </div>
              </div>
            )}
            {recommendation.activityCalories && (
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Flame className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Calories Burned</p>
                  <p className="text-xl font-bold text-gray-900">
                    {recommendation.activityCalories} cal
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Additional Metrics Display */}
          {recommendation.activityMetrics &&
            Object.keys(recommendation.activityMetrics).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Additional Metrics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(recommendation.activityMetrics)
                    .filter(([key]) => key !== "customActivityName")
                    .map(([key, value]) => (
                      <span
                        key={key}
                        className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
                      >
                        {key}: {value}
                      </span>
                    ))}
                </div>
              </div>
            )}
        </Card>
      )}

      {/* Overall Recommendation */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Overall Assessment
          </h2>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-100">
          <p className="text-gray-800 text-lg leading-relaxed">
            {cleanRecommendationText(recommendation.recommendation)}
          </p>
        </div>
      </Card>

      {/* Improvements Section */}
      {recommendation.improvements &&
        recommendation.improvements.length > 0 && (
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Areas for Improvement
              </h2>
            </div>
            <div className="space-y-3">
              {recommendation.improvements.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100 hover:border-green-200 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-green-200 rounded-full flex items-center justify-center text-green-700 font-semibold">
                    {index + 1}
                  </div>
                  <p className="text-gray-800 flex-1 pt-1">{item}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

      {/* Suggestions Section */}
      {recommendation.suggestions && recommendation.suggestions.length > 0 && (
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Lightbulb className="h-6 w-6 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Personalized Suggestions
            </h2>
          </div>
          <div className="space-y-3">
            {recommendation.suggestions.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-100 hover:border-yellow-200 transition-colors"
              >
                <div className="flex-shrink-0">
                  <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
                </div>
                <p className="text-gray-800 flex-1">{item}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Safety Tips Section */}
      {recommendation.safetyTips && recommendation.safetyTips.length > 0 && (
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Important Safety Tips
            </h2>
          </div>
          <div className="space-y-3">
            {recommendation.safetyTips.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border-2 border-red-100 hover:border-red-200 transition-colors"
              >
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                </div>
                <p className="text-gray-800 flex-1 font-medium">{item}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <Card className="bg-gray-50 border-dashed">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Ready to take action?
          </h3>
          <p className="text-gray-600 mb-4">
            Track more activities to get continuous AI-powered insights
          </p>
          <Button
            onClick={() => navigate("/activities")}
            className="inline-flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            Track New Activity
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default RecommendationDetailsPage;
