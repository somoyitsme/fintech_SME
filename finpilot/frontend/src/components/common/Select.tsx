import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, leftIcon, className = '', id, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-content-primary mb-1 select-none">
            {label}
            {props.required && <span className="text-status-danger ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-content-muted pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <select
            id={selectId}
            ref={ref}
            className={`w-full rounded-lg bg-surface text-content-primary border transition-colors duration-150 text-xs sm:text-sm px-3 py-2 pr-9 appearance-none focus:outline-none focus:ring-1 cursor-pointer ${
              leftIcon ? 'pl-9' : ''
            } ${
              error
                ? 'border-status-danger focus:border-status-danger focus:ring-status-danger'
                : 'border-boundary-strong focus:border-brand-ochre focus:ring-brand-ochre'
            } disabled:bg-surface-secondary disabled:cursor-not-allowed ${className}`}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="w-4 h-4 text-content-muted absolute right-3 pointer-events-none" />
        </div>
        {error ? (
          <p className="text-[11px] text-status-danger mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-content-muted mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
