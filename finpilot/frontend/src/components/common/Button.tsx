import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'brand' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-ochre disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-3.5 py-2 gap-2',
    lg: 'text-sm sm:text-base px-4 py-2.5 gap-2.5',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    // Enterprise primary: High contrast dark stone in light mode, deep warm surface with ochre border in dark
    primary: 'bg-stone-900 hover:bg-stone-800 text-white shadow-sm dark:bg-[#2A332A] dark:hover:bg-[#344034] dark:text-[#F5F5F0] dark:border dark:border-[#404E40]',
    // Golden Summer Fields brand ochre button with dark stone text (exceeds WCAG 2.2 AAA contrast)
    brand: 'bg-brand-ochre hover:bg-brand-ochreDark text-stone-950 font-semibold shadow-sm active:translate-y-px',
    secondary: 'bg-surface hover:bg-surface-secondary text-content-primary border border-boundary-strong shadow-xs',
    outline: 'bg-transparent hover:bg-surface-secondary text-content-secondary hover:text-content-primary border border-boundary-subtle',
    ghost: 'bg-transparent hover:bg-surface-secondary text-content-secondary hover:text-content-primary',
    danger: 'bg-status-danger hover:opacity-90 text-white shadow-sm',
    success: 'bg-status-success hover:opacity-90 text-white shadow-sm',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
      )}
      <span className="inline-flex min-w-0 items-center justify-center gap-1.5 leading-none [&>svg]:!m-0 [&>svg]:shrink-0">
        {children}
      </span>
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};
