import apiClient from "./apiClient";
import config from "@/config/config.js";

const BASE_URL = config.endpoints.recommendations;

/**
 * Recommendation Service API
 * Handles all AI recommendation-related API calls
 * Note: apiClient auto-extracts response.data
 */
export const recommendationService = {
  /**
   * Get recommendations by user ID
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  getUserRecommendations: async (userId) => {
    return await apiClient.get(`${BASE_URL}/user/${userId}`);
  },

  /**
   * Get recommendation by activity ID
   * @param {string} activityId
   * @returns {Promise<Object>}
   */
  getActivityRecommendation: async (activityId) => {
    return await apiClient.get(`${BASE_URL}/activity/${activityId}`);
  },

  /**
   * Get recommendation by recommendation ID
   * @param {string} recommendationId
   * @returns {Promise<Object>}
   */
  getRecommendationById: async (recommendationId) => {
    return await apiClient.get(`${BASE_URL}/${recommendationId}`);
  },
};

export default recommendationService;
