import React, { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Calendar, Clock, Flame, Trash2, X } from "lucide-react";
import Card from "@/components/common/Card.jsx";
import Button from "@/components/common/Button.jsx";
import Input from "@/components/common/Input.jsx";
import Select from "@/components/common/Select.jsx";
import Alert from "@/components/common/Alert.jsx";
import LoadingSpinner from "@/components/common/LoadingSpinner.jsx";
import Toast from "@/components/Toast.jsx";
import ConfirmDialog from "@/components/ConfirmDialog.jsx";
import useAuthStore from "@/store/authStore.js";
import { useToast } from "@/hooks/useToast.js";
import {
  activityService,
  ActivityTypes,
  getActivityTypeLabel,
} from "@/api/activityService.js";

/**
 * Activities Page
 * Track and view fitness activities
 */
const ActivitiesPage = () => {
  const { user } = useAuthStore();
  const { toasts, showToast, hideToast } = useToast();
  const activitiesListRef = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [activities, setActivities] = useState([]);
  const [newActivityId, setNewActivityId] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    activityId: null,
    activityType: null,
    activityName: null,
  });

  const [formData, setFormData] = useState({
    type: "",
    duration: "",
    caloriesBurned: "",
    startTime: new Date().toISOString().slice(0, 16),
    customActivityName: "",
    additionalMetrics: [],
  });

  const [formErrors, setFormErrors] = useState({});

  const activityOptions = Object.keys(ActivityTypes).map((key) => ({
    value: key,
    label: getActivityTypeLabel(key),
  }));

  const loadActivities = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoadingActivities(true);
      const response = await activityService.getUserActivities(user.id);
      // Extract data from response (backend returns {success, data, message})
      const activitiesData = response.data || response;
      setActivities(Array.isArray(activitiesData) ? activitiesData : []);
    } catch (err) {
      console.error("Failed to load activities:", err);
      setError("Failed to load activities");
    } finally {
      setLoadingActivities(false);
    }
  }, [user?.id]);

  // Fetch user activities on mount
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const addMetric = () => {
    setFormData((prev) => ({
      ...prev,
      additionalMetrics: [...prev.additionalMetrics, { key: "", value: "" }],
    }));
  };

  const removeMetric = (index) => {
    setFormData((prev) => ({
      ...prev,
      additionalMetrics: prev.additionalMetrics.filter((_, i) => i !== index),
    }));
  };

  const updateMetric = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      additionalMetrics: prev.additionalMetrics.map((metric, i) =>
        i === index ? { ...metric, [field]: value } : metric
      ),
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.type) {
      errors.type = "Activity type is required";
    }

    // Validate custom activity name if "OTHERS" is selected
    if (formData.type === "OTHERS" && !formData.customActivityName.trim()) {
      errors.customActivityName = "Please enter activity name";
    }

    if (!formData.duration || formData.duration <= 0) {
      errors.duration = "Duration must be greater than 0";
    }
    if (!formData.caloriesBurned || formData.caloriesBurned <= 0) {
      errors.caloriesBurned = "Calories burned must be greater than 0";
    }
    if (!formData.startTime) {
      errors.startTime = "Start time is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Build additional metrics object
      const additionalMetrics = {};

      // Add custom activity name if "Others" is selected
      if (formData.type === "OTHERS" && formData.customActivityName.trim()) {
        additionalMetrics.customActivityName =
          formData.customActivityName.trim();
      }

      // Add custom metrics (filter out empty entries)
      formData.additionalMetrics.forEach((metric) => {
        if (metric.key.trim() && metric.value.trim()) {
          additionalMetrics[metric.key.trim()] = metric.value.trim();
        }
      });

      const activityData = {
        userId: user.id,
        type: formData.type,
        duration: parseInt(formData.duration),
        caloriesBurned: parseInt(formData.caloriesBurned),
        startTime: new Date(formData.startTime).toISOString(),
        ...(Object.keys(additionalMetrics).length > 0 && { additionalMetrics }),
      };

      const response = await activityService.trackActivity(activityData);

      // Extract activity ID from response
      const activityId = response?.id || response?.data?.id;

      // Show success toast with AI insights prompt
      const activityLabel =
        formData.type === "OTHERS" && formData.customActivityName.trim()
          ? formData.customActivityName
          : getActivityTypeLabel(formData.type);

      showToast(
        `🎉 ${activityLabel} tracked! AI generating insights...`,
        "success"
      );

      // Show AI insights navigation prompt after 2 seconds
      setTimeout(() => {
        showToast(
          "💡 Check AI Insights page for the analysis in some time...",
          "info"
        );
      }, 3000);

      // Reset form
      setFormData({
        type: "",
        duration: "",
        caloriesBurned: "",
        startTime: new Date().toISOString().slice(0, 16),
        customActivityName: "",
        additionalMetrics: [],
      });

      // Close form
      setShowForm(false);

      // Reload activities
      await loadActivities();

      // Set the new activity ID to highlight it
      if (activityId) {
        setNewActivityId(activityId);
        // Clear highlight after 3 seconds
        setTimeout(() => setNewActivityId(null), 3000);
      }

      // Scroll to activities list
      setTimeout(() => {
        activitiesListRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (err) {
      const errorMessage = err.message || "Failed to track activity";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (activityId, activityType, activityName) => {
    setDeleteDialog({
      isOpen: true,
      activityId,
      activityType,
      activityName,
    });
  };

  const handleDeleteConfirm = async () => {
    const { activityId, activityName } = deleteDialog;

    try {
      await activityService.deleteActivity(activityId);
      showToast(`${activityName} deleted`, "success");

      // Reload activities
      await loadActivities();
    } catch (err) {
      const errorMessage = err.message || "Delete failed";
      showToast(errorMessage, "error");
    } finally {
      setDeleteDialog({
        isOpen: false,
        activityId: null,
        activityType: null,
        activityName: null,
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({
      isOpen: false,
      activityId: null,
      activityType: null,
      activityName: null,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
          <p className="text-gray-600 mt-1">Track your fitness activities</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Track Activity
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess(null)}
        />
      )}
      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {/* Activity Form */}
      {showForm && (
        <Card title="Track New Activity">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Activity Type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              options={activityOptions}
              error={formErrors.type}
              required
            />

            {/* Custom Activity Name (shown only for "Others") */}
            {formData.type === "OTHERS" && (
              <Input
                label="Custom Activity Name"
                name="customActivityName"
                type="text"
                value={formData.customActivityName}
                onChange={handleInputChange}
                placeholder="e.g., Rock Climbing, Dancing"
                error={formErrors.customActivityName}
                required
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Duration (minutes)"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="e.g., 30"
                error={formErrors.duration}
                required
              />

              <Input
                label="Calories Burned"
                name="caloriesBurned"
                type="number"
                value={formData.caloriesBurned}
                onChange={handleInputChange}
                placeholder="e.g., 250"
                error={formErrors.caloriesBurned}
                required
              />
            </div>

            <Input
              label="Start Time"
              name="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={handleInputChange}
              error={formErrors.startTime}
              required
              max={new Date().toISOString().slice(0, 16)}
            />

            {/* Additional Metrics */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Additional Metrics (Optional)
                </label>
                <button
                  type="button"
                  onClick={addMetric}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Metric
                </button>
              </div>

              {formData.additionalMetrics.length > 0 && (
                <div className="space-y-2">
                  {formData.additionalMetrics.map((metric, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <Input
                        placeholder="e.g., Heart Rate"
                        value={metric.key}
                        onChange={(e) =>
                          updateMetric(index, "key", e.target.value)
                        }
                        className="flex-1"
                      />
                      <Input
                        placeholder="e.g., 145 bpm"
                        value={metric.value}
                        onChange={(e) =>
                          updateMetric(index, "value", e.target.value)
                        }
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeMetric(index)}
                        className="mt-2 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {formData.additionalMetrics.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  Add metrics like distance, heart rate, steps, pace, etc.
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={loading} className="flex-1">
                Track Activity
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Activities List */}
      <div ref={activitiesListRef}>
        <Card title="Activity History">
          {loadingActivities ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No activities tracked yet</p>
              <p className="text-sm">
                Start tracking your activities to see them here!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
                    activity.id === newActivityId
                      ? "bg-green-50 border-2 border-green-500 shadow-lg scale-105"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-full ${
                          activity.id === newActivityId
                            ? "bg-green-200"
                            : "bg-primary-100"
                        }`}
                      >
                        <span className="text-2xl">
                          {getActivityIcon(activity.type)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {activity.type === "OTHERS" &&
                            activity.additionalMetrics?.customActivityName
                              ? activity.additionalMetrics.customActivityName
                              : getActivityTypeLabel(activity.type)}
                          </h3>
                          {activity.id === newActivityId && (
                            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-medium">
                              NEW
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(activity.startTime).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {activity.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="h-4 w-4" />
                            {activity.caloriesBurned} cal
                          </span>
                        </div>

                        {/* Additional Metrics Display */}
                        {activity.additionalMetrics &&
                          Object.keys(activity.additionalMetrics).length >
                            0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {Object.entries(activity.additionalMetrics)
                                .filter(([key]) => key !== "customActivityName")
                                .map(([key, value]) => (
                                  <span
                                    key={key}
                                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                                  >
                                    {key}: {value}
                                  </span>
                                ))}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleDeleteClick(
                        activity.id,
                        activity.type,
                        activity.type === "OTHERS" &&
                          activity.additionalMetrics?.customActivityName
                          ? activity.additionalMetrics.customActivityName
                          : getActivityTypeLabel(activity.type)
                      )
                    }
                    className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete activity"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Activity"
        message={`Are you sure you want to delete "${deleteDialog.activityName}" activity? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

// Helper function to get activity icon emoji
const getActivityIcon = (type) => {
  const icons = {
    RUNNING: "🏃",
    CYCLING: "🚴",
    SWIMMING: "🏊",
    WALKING: "🚶",
    YOGA: "🧘",
    STRENGTH_TRAINING: "💪",
    WEIGHT_TRAINING: "🏋️",
    HIIT: "⚡",
    DANCE: "💃",
    PILATES: "🤸",
    OTHERS: "🎯",
  };
  return icons[type] || "🎯";
};

export default ActivitiesPage;
