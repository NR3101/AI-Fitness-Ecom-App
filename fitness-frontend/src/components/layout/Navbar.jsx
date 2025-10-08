import React from "react";
import { Link } from "react-router-dom";
import { Activity, LogOut, Sparkles } from "lucide-react";
import useAuthStore from "@/store/authStore.js";
import { logout as keycloakLogout } from "@/config/keycloak.js";
import { getInitials } from "@/utils/helpers.js";

/**
 * Navbar Component
 * Main navigation header
 */
const Navbar = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    keycloakLogout();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">FitTracker</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/activities"
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
            >
              Activities
            </Link>
            <Link
              to="/recommendations"
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium flex items-center gap-1"
            >
              <Sparkles className="h-4 w-4" />
              AI Insights
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                  {getInitials(user.firstName, user.lastName)}
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
