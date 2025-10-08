import { create } from "zustand";

/**
 * Activity Store
 * Manages activity-related state
 */
const useActivityStore = create((set) => ({
  // State
  activities: [],
  currentActivity: null,
  loading: false,
  error: null,

  // Actions
  setActivities: (activities) => set({ activities }),

  setCurrentActivity: (activity) => set({ currentActivity: activity }),

  addActivity: (activity) =>
    set((state) => ({
      activities: [activity, ...state.activities],
    })),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),
}));

export default useActivityStore;
