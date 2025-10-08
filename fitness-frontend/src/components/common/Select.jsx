import React from "react";

/**
 * Select Component
 * Reusable select dropdown with label and error message
 */
const Select = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  options = [],
  error,
  disabled = false,
  required = false,
  placeholder = "Select an option",
  className = "",
  ...props
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`input-field ${
          error ? "border-red-500 focus:ring-red-500" : ""
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Select;
