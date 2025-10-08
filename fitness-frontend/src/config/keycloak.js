import Keycloak from "keycloak-js";
import config from "./config";

/**
 * Keycloak instance configuration
 * Using PKCE (Proof Key for Code Exchange) flow for enhanced security
 */
const keycloakConfig = {
  url: config.keycloak.url,
  realm: config.keycloak.realm,
  clientId: config.keycloak.clientId,
};

// Singleton instance
let keycloak = null;
let isInitialized = false;
let initPromise = null;

/**
 * Get or create Keycloak instance
 */
const getKeycloakInstance = () => {
  if (!keycloak) {
    keycloak = new Keycloak(keycloakConfig);
  }
  return keycloak;
};

/**
 * Initialize Keycloak with PKCE flow
 * @returns {Promise<boolean>} - Returns true if authenticated
 */
export const initKeycloak = async () => {
  // If already initialized, return the previous result
  if (isInitialized) {
    console.log("Keycloak already initialized");
    return getKeycloakInstance().authenticated || false;
  }

  // If initialization is in progress, return the same promise
  if (initPromise) {
    console.log("Keycloak initialization in progress, waiting...");
    return initPromise;
  }

  // Start initialization
  const instance = getKeycloakInstance();

  initPromise = instance
    .init({
      onLoad: "check-sso",
      pkceMethod: "S256", // PKCE flow
      checkLoginIframe: false,
      silentCheckSsoRedirectUri:
        window.location.origin + "/silent-check-sso.html",
    })
    .then((authenticated) => {
      isInitialized = true;
      initPromise = null;

      if (authenticated) {
        console.log("User is authenticated");
        // Setup token refresh
        setupTokenRefresh();
      } else {
        console.log("User is not authenticated");
      }

      return authenticated;
    })
    .catch((error) => {
      console.error("Failed to initialize Keycloak", error);
      initPromise = null;
      throw error;
    });

  return initPromise;
};

/**
 * Setup automatic token refresh
 */
const setupTokenRefresh = () => {
  const instance = getKeycloakInstance();

  // Refresh token every 5 minutes or when it expires
  setInterval(() => {
    instance
      .updateToken(70) // Refresh if token expires in 70 seconds
      .then((refreshed) => {
        if (refreshed) {
          console.log("Token refreshed");
        }
      })
      .catch(() => {
        console.error("Failed to refresh token");
        instance.login();
      });
  }, 60000); // Check every minute
};

/**
 * Login user
 */
export const login = () => {
  getKeycloakInstance().login({
    redirectUri: window.location.origin,
  });
};

/**
 * Logout user
 */
export const logout = () => {
  getKeycloakInstance().logout({
    redirectUri: window.location.origin,
  });
};

/**
 * Get authentication token
 * @returns {string|null}
 */
export const getToken = () => {
  const instance = getKeycloakInstance();
  return instance.token || null;
};

/**
 * Get user profile
 * @returns {Object|null}
 */
export const getUserProfile = () => {
  const instance = getKeycloakInstance();
  if (!instance.tokenParsed) return null;

  return {
    id: instance.tokenParsed.sub,
    email: instance.tokenParsed.email,
    firstName: instance.tokenParsed.given_name,
    lastName: instance.tokenParsed.family_name,
    name: instance.tokenParsed.name,
    roles: instance.tokenParsed.realm_access?.roles || [],
  };
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return getKeycloakInstance().authenticated || false;
};

/**
 * Check if user has specific role
 * @param {string} role
 * @returns {boolean}
 */
export const hasRole = (role) => {
  return getKeycloakInstance().hasRealmRole(role);
};

/**
 * Export Keycloak instance getter
 */
export { getKeycloakInstance };

export default getKeycloakInstance;
