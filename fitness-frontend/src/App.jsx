import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initKeycloak, getUserProfile } from "./config/keycloak.js";
import useAuthStore from "./store/authStore.js";
import { userService } from "./api/userService.js";

// Layout Components
import MainLayout from "./components/layout/MainLayout.jsx";
import ProtectedRoute from "./components/layout/ProtectedRoute.jsx";

// Pages
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ActivitiesPage from "./pages/ActivitiesPage.jsx";
import RecommendationsPage from "./pages/RecommendationsPage.jsx";
import RecommendationDetailsPage from "./pages/RecommendationDetailsPage.jsx";

// Common Components
import LoadingSpinner from "./components/common/LoadingSpinner";

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const [initializing, setInitializing] = useState(true);
  const { initAuth } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const authenticated = await initKeycloak();

        if (!isMounted) return; // Component unmounted, stop here

        initAuth();

        // Sync user with backend after successful authentication
        if (authenticated) {
          const profile = getUserProfile();
          if (profile) {
            try {
              await userService.syncUser(profile);
            } catch (error) {
              console.error("Failed to sync user with backend:", error);
              // Don't block the app if user sync fails
            }
          }
        }
      } catch (error) {
        console.error("Failed to initialize app:", error);
      } finally {
        if (isMounted) {
          setInitializing(false);
        }
      }
    };

    init();

    // Cleanup function for React StrictMode
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="activities" element={<ActivitiesPage />} />
            <Route path="recommendations" element={<RecommendationsPage />} />
            <Route
              path="recommendations/:id"
              element={<RecommendationDetailsPage />}
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
