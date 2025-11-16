'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      id,
      type = 'text',
      className = '',
      showPasswordToggle,
      onTogglePassword,
      disabled,
      ...props
    },
    ref
  ) => {
    // Auto-generate ID from label if not provided
    const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');
    const errorId = `${fieldId}-error`;
    const helperId = `${fieldId}-helper`;

    return (
      <div className="space-y-2">
        {/* Label with required indicator */}
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-gray-200"
        >
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>

        {/* Input wrapper for icon positioning */}
        <div className="relative">
          {/* Left icon */}
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Icon size={20} />
            </div>
          )}

          {/* Input field */}
          <input
            ref={ref}
            id={fieldId}
            type={type}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={`
              w-full 
              ${Icon ? 'pl-10' : 'pl-4'} 
              ${showPasswordToggle ? 'pr-10' : 'pr-4'} 
              py-2.5 
              bg-gray-700 
              border 
              rounded-lg 
              focus:outline-none 
              focus:ring-2 
              transition-all
              disabled:opacity-50 
              disabled:cursor-not-allowed
              ${
                error
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
              }
              text-white 
              placeholder-gray-400
              ${className}
            `}
            {...props}
          />

          {/* Password visibility toggle */}
          {showPasswordToggle && (
            <button
              type="button"
              onClick={onTogglePassword}
              disabled={disabled}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={type === 'password' ? 'Show password' : 'Hide password'}
              tabIndex={-1} // Remove from tab order
            >
              {type === 'password' ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>

        {/* Helper text or error message */}
        {error ? (
          <div
            id={errorId}
            className="flex items-start gap-2 text-sm text-red-400"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : helperText ? (
          <p id={helperId} className="text-sm text-gray-400">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

FormField.displayName = 'FormField';