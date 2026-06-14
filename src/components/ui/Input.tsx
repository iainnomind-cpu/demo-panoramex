import React, { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leftIcon?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, leftIcon, error, className = '', id, ...props }, ref) => {
    const inputId = id || Math.random().toString(36).substring(2, 9);
    
    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-on-surface-variant mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
              <span className="material-symbols-outlined text-[20px]">{leftIcon}</span>
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`block w-full rounded-md border ${
              error ? 'border-error' : 'border-outline-variant'
            } bg-surface py-2 ${leftIcon ? 'pl-10' : 'pl-3'} pr-3 text-sm placeholder:text-outline focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:bg-surface-variant`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
