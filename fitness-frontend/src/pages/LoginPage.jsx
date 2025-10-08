import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Activity } from "lucide-react";
import useAuthStore from "@/store/authStore.js";
import { login } from "@/config/keycloak.js";
import Button from "@/components/common/Button.jsx";

/**
 * Login Page
 * Landing page with Keycloak login
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = () => {
    login();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-600 rounded-full">
              <Activity className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to FitTracker
          </h1>
          <p className="text-gray-600">
            Track your fitness journey with AI-powered insights
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Sign in to your account
          </h2>

          <Button onClick={handleLogin} className="w-full" size="lg">
            Sign in with Keycloak
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Secure authentication powered by Keycloak
            </p>
            <p className="text-sm text-gray-700">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-primary-600 mb-1">📊</div>
            <p className="text-xs text-gray-600">Track Activities</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-primary-600 mb-1">🤖</div>
            <p className="text-xs text-gray-600">AI Insights</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-primary-600 mb-1">🎯</div>
            <p className="text-xs text-gray-600">Goals</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
