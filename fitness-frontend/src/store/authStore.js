import { create } from "zustand";
import {
  getUserProfile,
  isAuthenticated as checkAuth,
} from "@/config/keycloak.js";

/**
 * Authentication Store
 * Manages authentication state across the application
 */
const useAuthStore = create((set, get) => ({
  // State
  isAuthenticated: false,
  user: null,
  loading: true,

  // Actions
  setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),

  setUser: (user) => set({ user }),

  setLoading: (loading) => set({ loading }),

  /**
   * Initialize auth state from Keycloak
   */
  initAuth: () => {
    const authenticated = checkAuth();
    const user = authenticated ? getUserProfile() : null;

    set({
      isAuthenticated: authenticated,
      user,
      loading: false,
    });
  },

  /**
   * Update user profile
   */
  updateUserProfile: (profileData) => {
    const currentUser = get().user;
    set({
      user: {
        ...currentUser,
        ...profileData,
      },
    });
  },

  /**
   * Logout and clear state
   */
  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
    });
  },
}));

export default useAuthStore;
