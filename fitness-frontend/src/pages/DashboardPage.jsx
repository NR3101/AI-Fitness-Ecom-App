import React, { useState, useEffect, useCallback } from "react";
import { Activity, TrendingUp, Flame, Clock } from "lucide-react";
import useAuthStore from "@/store/authStore.js";
import Card from "@/components/common/Card.jsx";
import Button from "@/components/common/Button.jsx";
import LoadingSpinner from "@/components/common/LoadingSpinner.jsx";
import { useNavigate } from "react-router-dom";
import { recommendationService } from "@/api/recommendationService.js";
import { activityService } from "@/api/activityService.js";
import { formatTimeAgo } from "@/utils/helpers.js";

/**
 * Dashboard Page
 * Main dashboard with overview statistics
 */
const DashboardPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const loadRecommendations = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await recommendationService.getUserRecommendations(user.id);
      setRecommendations(data.slice(0, 3)); // Show latest 3
    } catch (error) {
      console.error("Failed to load recommendations:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const loadActivities = useCallback(async () => {
    if (!user?.id) return;

    try {
      setStatsLoading(true);
      const response = await activityService.getUserActivities(user.id);
      const activitiesData = response.data || response;
      setActivities(Array.isArray(activitiesData) ? activitiesData : []);
    } catch (error) {
      console.error("Failed to load activities:", error);
    } finally {
      setStatsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadRecommendations();
    loadActivities();
  }, [loadRecommendations, loadActivities]);

  // Calculate statistics from activities
  const calculateStats = () => {
    const totalActivities = activities.length;
    const totalCalories = activities.reduce(
      (sum, activity) => sum + (activity.caloriesBurned || 0),
      0
    );
    const totalMinutes = activities.reduce(
      (sum, activity) => sum + (activity.duration || 0),
      0
    );
    const totalHours = (totalMinutes / 60).toFixed(1);

    // Calculate this week's activities
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekActivities = activities.filter(
      (activity) => new Date(activity.startTime) >= oneWeekAgo
    ).length;

    return {
      totalActivities,
      totalCalories,
      totalHours,
      thisWeekActivities,
    };
  };

  const stats_data = calculateStats();

  // Statistics cards
  const stats = [
    {
      label: "Total Activities",
      value: statsLoading ? "..." : stats_data.totalActivities.toString(),
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Calories Burned",
      value: statsLoading ? "..." : stats_data.totalCalories.toLocaleString(),
      icon: Flame,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      label: "Total Duration",
      value: statsLoading ? "..." : `${stats_data.totalHours} hrs`,
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "This Week",
      value: statsLoading ? "..." : stats_data.thisWeekActivities.toString(),
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-primary-100">
          Ready to crush your fitness goals today?
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => navigate("/activities")}
            className="w-full justify-center"
            size="lg"
          >
            <Activity className="mr-2 h-5 w-5" />
            Track New Activity
          </Button>
          <Button
            onClick={() => navigate("/recommendations")}
            variant="outline"
            className="w-full justify-center"
            size="lg"
          >
            View AI Insights
          </Button>
        </div>
      </Card>

      {/* Recent AI Recommendations */}
      <Card
        title="Recent AI Recommendations"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/recommendations")}
          >
            View All
          </Button>
        }
      >
        {loading ? (
          <LoadingSpinner />
        ) : recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => navigate(`/recommendations`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{rec.type}</h4>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(rec.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {rec.recommendation}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">No recommendations yet</p>
            <p className="text-sm">
              Track your first activity to get AI-powered insights!
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;
