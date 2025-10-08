import apiClient from "./apiClient";
import config from "@/config/config.js";

const BASE_URL = config.endpoints.activities;

/**
 * Activity Service API
 * Handles all activity-related API calls
 * Note: apiClient auto-extracts response.data
 */
export const activityService = {
  /**
   * Track new activity
   * @param {Object} activityData
   * @param {string} activityData.userId
   * @param {string} activityData.type - Activity type (RUNNING, CYCLING, etc.)
   * @param {number} activityData.duration - Duration in minutes
   * @param {number} activityData.caloriesBurned
   * @param {string} activityData.startTime - ISO date string
   * @param {Object} activityData.additionalMetrics - Optional metrics
   * @returns {Promise<Object>}
   */
  trackActivity: async (activityData) => {
    return await apiClient.post(BASE_URL, activityData);
  },

  /**
   * Get all activities for a user
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  getUserActivities: async (userId) => {
    return await apiClient.get(`${BASE_URL}/user/${userId}`);
  },

  /**
   * Get activity by ID
   * @param {string} activityId
   * @returns {Promise<Object>}
   */
  getActivityById: async (activityId) => {
    return await apiClient.get(`${BASE_URL}/${activityId}`);
  },

  /**
   * Delete activity by ID
   * @param {string} activityId
   * @returns {Promise<Object>}
   */
  deleteActivity: async (activityId) => {
    return await apiClient.delete(`${BASE_URL}/${activityId}`);
  },
};

/**
 * Activity Types Enum
 */
export const ActivityTypes = {
  RUNNING: "RUNNING",
  CYCLING: "CYCLING",
  SWIMMING: "SWIMMING",
  WALKING: "WALKING",
  YOGA: "YOGA",
  STRENGTH_TRAINING: "STRENGTH_TRAINING",
  WEIGHT_TRAINING: "WEIGHT_TRAINING",
  HIIT: "HIIT",
  DANCE: "DANCE",
  PILATES: "PILATES",
  OTHERS: "OTHERS",
};

/**
 * Get activity type display name
 * @param {string} type
 * @returns {string}
 */
export const getActivityTypeLabel = (type) => {
  const labels = {
    RUNNING: "Running",
    CYCLING: "Cycling",
    SWIMMING: "Swimming",
    WALKING: "Walking",
    YOGA: "Yoga",
    STRENGTH_TRAINING: "Strength Training",
    WEIGHT_TRAINING: "Weight Training",
    HIIT: "HIIT",
    DANCE: "Dance",
    PILATES: "Pilates",
    OTHERS: "Others",
  };
  return labels[type] || type;
};

export default activityService;
