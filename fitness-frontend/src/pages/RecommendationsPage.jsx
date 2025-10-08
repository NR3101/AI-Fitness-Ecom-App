import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/common/Card.jsx";
import Button from "@/components/common/Button.jsx";
import LoadingSpinner from "@/components/common/LoadingSpinner.jsx";
import Alert from "@/components/common/Alert.jsx";
import useAuthStore from "@/store/authStore.js";
import { recommendationService } from "@/api/recommendationService.js";
import { getActivityTypeLabel } from "@/api/activityService.js";
import { formatDate } from "@/utils/helpers.js";

/**
 * Recommendations Page
 * Display AI-powered recommendations
 */
const RecommendationsPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await recommendationService.getUserRecommendations(user.id);
      setRecommendations(data);
    } catch (err) {
      setError(err.message || "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadRecommendations();
    }
  }, [user?.id, loadRecommendations]);

  const getRecommendationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "improvement":
        return TrendingUp;
      case "suggestion":
        return Lightbulb;
      case "safety":
        return AlertTriangle;
      default:
        return Sparkles;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-8 w-8" />
              <h1 className="text-3xl font-bold">AI Insights</h1>
            </div>
            <p className="text-purple-100">
              Personalized insights powered by AI to help you achieve your
              fitness goals
            </p>
          </div>
          <Button
            onClick={loadRecommendations}
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 text-white border-0"
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {/* Loading State */}
      {loading ? (
        <Card>
          <div className="py-12">
            <LoadingSpinner size="lg" />
            <p className="text-center text-gray-500 mt-4">
              Loading your AI-powered insights...
            </p>
            <p className="text-center text-gray-400 text-sm mt-2">
              Our AI is analyzing your activities to generate personalized
              recommendations
            </p>
          </div>
        </Card>
      ) : recommendations.length === 0 ? (
        /* Empty State */
        <Card>
          <div className="text-center py-12">
            <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No AI insights yet
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Start tracking your activities to receive AI-powered insights and
              recommendations tailored to your fitness journey!
            </p>
            <p className="text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg mx-auto">
              💡 <strong>Tip:</strong> After tracking an activity, AI insights
              are generated within a few moments. Check back here or refresh
              this page to see your personalized recommendations.
            </p>
            <Button onClick={() => navigate("/activities")} className="mt-6">
              Track Your First Activity
            </Button>
          </div>
        </Card>
      ) : (
        /* Recommendations List */
        <div className="space-y-6">
          {recommendations.map((rec) => {
            const Icon = getRecommendationIcon(rec.type);
            return (
              <Card
                key={rec.id}
                className="hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => navigate(`/recommendations/${rec.id}`)}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <Icon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {rec.activityName ||
                            getActivityTypeLabel(rec.activityType)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(rec.createdAt, "PPpp")}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                  </div>

                  {/* Preview of Main Recommendation */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                    <p className="text-gray-800 leading-relaxed line-clamp-3">
                      {rec.recommendation}
                    </p>
                  </div>

                  {/* Summary Badges */}
                  <div className="flex gap-2 flex-wrap">
                    {rec.improvements && rec.improvements.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        <TrendingUp className="h-3 w-3" />
                        {rec.improvements.length} Improvements
                      </span>
                    )}
                    {rec.suggestions && rec.suggestions.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                        <Lightbulb className="h-3 w-3" />
                        {rec.suggestions.length} Suggestions
                      </span>
                    )}
                    {rec.safetyTips && rec.safetyTips.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        <AlertTriangle className="h-3 w-3" />
                        {rec.safetyTips.length} Safety Tips
                      </span>
                    )}
                  </div>

                  {/* Click to view details hint */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-sm text-gray-500 group-hover:text-purple-600 transition-colors">
                      Click to view full details →
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
