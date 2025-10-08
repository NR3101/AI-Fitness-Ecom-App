/**
 * Application Configuration
 * Centralized configuration for the entire application
 */

export const config = {
  // API Gateway Configuration
  apiGateway: {
    baseUrl: import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:8080",
    timeout: 30000,
  },

  // Keycloak Configuration
  keycloak: {
    url: import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8181",
    realm: import.meta.env.VITE_KEYCLOAK_REALM || "fitness-app",
    clientId:
      import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "fitness-frontend-client",
  },

  // API Endpoints
  endpoints: {
    users: "/api/v1/users",
    activities: "/api/v1/activities",
    recommendations: "/api/v1/recommendations",
  },

  // Application Settings
  app: {
    name: "Fitness Tracker",
    version: "1.0.0",
  },
};

export default config;
