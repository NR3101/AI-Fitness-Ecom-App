import React from "react";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

/**
 * Alert Component
 * Display messages with different types (success, error, warning, info)
 */
const Alert = ({ type = "info", message, onClose, className = "" }) => {
  const types = {
    success: {
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800",
      icon: CheckCircle,
    },
    error: {
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-800",
      icon: XCircle,
    },
    warning: {
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-800",
      icon: AlertCircle,
    },
    info: {
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
      icon: Info,
    },
  };

  const config = types[type];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-start p-4 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}
    >
      <Icon
        className={`h-5 w-5 ${config.textColor} mr-3 flex-shrink-0 mt-0.5`}
      />
      <div className={`flex-1 ${config.textColor}`}>
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`ml-3 inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.textColor}`}
        >
          <XCircle className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default Alert;
