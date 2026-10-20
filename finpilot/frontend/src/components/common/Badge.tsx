import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand' | 'sage' | 'olive' | 'sand';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-[11.5px] px-2.5 py-0.5 gap-1.5',
  };

  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
    success: {
      container: 'bg-status-successBg text-status-success border border-status-successBorder font-medium',
      dot: 'bg-status-success',
    },
    warning: {
      container: 'bg-status-warningBg text-status-warning border border-status-warningBorder font-medium',
      dot: 'bg-status-warning',
    },
    danger: {
      container: 'bg-status-dangerBg text-status-danger border border-status-dangerBorder font-medium',
      dot: 'bg-status-danger',
    },
    info: {
      container: 'bg-status-infoBg text-status-info border border-status-infoBorder font-medium',
      dot: 'bg-status-info',
    },
    neutral: {
      container: 'bg-surface-secondary text-content-secondary border border-boundary-subtle font-medium',
      dot: 'bg-content-muted',
    },
    brand: {
      container: 'bg-brand-ochre/15 text-stone-900 dark:text-brand-ochre border border-brand-ochre/30 font-semibold',
      dot: 'bg-brand-ochre',
    },
    sage: {
      container: 'bg-brand-sage/25 text-stone-900 dark:text-brand-sage border border-brand-sage/40 font-semibold',
      dot: 'bg-brand-sageDark',
    },
    olive: {
      container: 'bg-brand-olive/30 text-stone-900 dark:text-brand-olive border border-brand-olive/40 font-semibold',
      dot: 'bg-brand-oliveDark',
    },
    sand: {
      container: 'bg-brand-sand/30 text-stone-900 dark:text-brand-sand border border-brand-sand/40 font-semibold',
      dot: 'bg-brand-ochre',
    },
  };

  const { container, dot: dotColor } = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center rounded-full whitespace-nowrap tracking-wide select-none ${sizeStyles[size]} ${container} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />}
      <span>{children}</span>
    </span>
  );
};
