import apiClient from "./apiClient";
import config from "@/config/config.js";

const BASE_URL = config.endpoints.users;

/**
 * User Service API
 * Handles all user-related API calls
 * Note: apiClient auto-extracts response.data
 */
export const userService = {
  /**
   * Get all users
   * @returns {Promise<Array>}
   */
  getAllUsers: async () => {
    return await apiClient.get(BASE_URL);
  },

  /**
   * Get user by ID
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  getUserById: async (userId) => {
    return await apiClient.get(`${BASE_URL}/${userId}`);
  },

  /**
   * Validate user existence
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  validateUser: async (userId) => {
    return await apiClient.get(`${BASE_URL}/${userId}/validate`);
  },

  /**
   * Get user by Keycloak ID
   * @param {string} keycloakId
   * @returns {Promise<Object>}
   */
  getUserByKeycloakId: async (keycloakId) => {
    return await apiClient.get(`${BASE_URL}/keycloak/${keycloakId}`);
  },

  /**
   * Sync user from Keycloak to backend database
   * Backend handles user existence check and creation/update logic
   * @param {Object} keycloakProfile - User profile from Keycloak
   * @returns {Promise<Object>}
   */
  syncUser: async (keycloakProfile) => {
    return await apiClient.post(`${BASE_URL}/sync`, {
      keycloakId: keycloakProfile.id,
      email: keycloakProfile.email,
      firstName: keycloakProfile.firstName || "User",
      lastName: keycloakProfile.lastName || "",
      password: "keycloak-managed", // Placeholder - password managed by Keycloak
    });
  },

  /**
   * Sign up a new user in Keycloak and database
   * @param {Object} signupData - firstName, lastName, email, password
   * @returns {Promise<Object>}
   */
  signup: async (signupData) => {
    return await apiClient.post("/api/v1/users/signup", signupData);
  },
};

export default userService;
