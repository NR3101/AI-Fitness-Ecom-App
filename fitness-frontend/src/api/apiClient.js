import axios from "axios";
import config from "@/config/config.js";
import { getToken, login } from "@/config/keycloak.js";

// Utility to check if endpoint is public
const isPublicEndpoint = (url) => url?.includes("/signup");

/**
 * Create Axios instance with default configuration
 */
const apiClient = axios.create({
  baseURL: config.apiGateway.baseUrl,
  timeout: config.apiGateway.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor
 * Adds authentication token to all requests (except public endpoints)
 */
apiClient.interceptors.request.use(
  (config) => {
    // Skip token for public endpoints
    if (!isPublicEndpoint(config.url)) {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Auto-extracts data and handles common error scenarios
 */
apiClient.interceptors.response.use(
  (response) => {
    // Auto-extract data from successful responses
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const requestUrl = error.config?.url || "";

      switch (status) {
        case 401:
          // Unauthorized - redirect to login only if not a public endpoint
          if (!isPublicEndpoint(requestUrl)) {
            console.error("Unauthorized access - redirecting to login");
            login();
          } else {
            console.error("Signup failed with 401 - authentication issue");
          }
          break;

        case 403:
          // Forbidden
          console.error("Forbidden - insufficient permissions");
          break;

        case 404:
          // Not Found
          console.error("Resource not found");
          break;

        case 500:
          // Internal Server Error
          console.error("Internal server error");
          break;

        default:
          console.error("API Error:", data?.message || "Unknown error");
      }

      // Return formatted error
      return Promise.reject({
        status,
        message: data?.message || "An error occurred",
        errors: data?.errors || [],
        response: error.response, // Include full response for detailed error handling
      });
    } else if (error.request) {
      // Request made but no response received
      console.error("Network error - no response from server");
      return Promise.reject({
        status: 0,
        message: "Network error - please check your connection",
      });
    } else {
      // Error in request setup
      console.error("Request error:", error.message);
      return Promise.reject({
        status: 0,
        message: error.message || "Request failed",
      });
    }
  }
);

export default apiClient;
