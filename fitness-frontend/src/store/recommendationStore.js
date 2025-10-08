import { create } from "zustand";

/**
 * Recommendation Store
 * Manages AI recommendation state
 */
const useRecommendationStore = create((set) => ({
  // State
  recommendations: [],
  currentRecommendation: null,
  loading: false,
  error: null,

  // Actions
  setRecommendations: (recommendations) => set({ recommendations }),

  setCurrentRecommendation: (recommendation) =>
    set({ currentRecommendation: recommendation }),

  addRecommendation: (recommendation) =>
    set((state) => ({
      recommendations: [recommendation, ...state.recommendations],
    })),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),
}));

export default useRecommendationStore;
