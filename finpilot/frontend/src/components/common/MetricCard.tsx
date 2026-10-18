import React from 'react';

export type MetricAccent = 'ochre' | 'sage' | 'olive' | 'sand' | 'neutral';

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  accent?: MetricAccent;
  trend?: {
    value: string;
    isPositive?: boolean;
    neutral?: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  accent = 'ochre',
  trend,
  onClick,
  className = '',
}) => {
  const accentStyles: Record<MetricAccent, { iconBg: string; iconColor: string; borderFocus: string }> = {
    ochre: {
      iconBg: 'bg-brand-ochre/15 dark:bg-brand-ochre/20',
      iconColor: 'text-brand-ochreDeep dark:text-brand-ochre',
      borderFocus: 'hover:border-brand-ochre/60',
    },
    sage: {
      iconBg: 'bg-brand-sage/25 dark:bg-brand-sage/20',
      iconColor: 'text-stone-800 dark:text-brand-sage',
      borderFocus: 'hover:border-brand-sage',
    },
    olive: {
      iconBg: 'bg-brand-olive/30 dark:bg-brand-olive/20',
      iconColor: 'text-stone-800 dark:text-brand-olive',
      borderFocus: 'hover:border-brand-olive',
    },
    sand: {
      iconBg: 'bg-brand-sand/30 dark:bg-brand-sand/20',
      iconColor: 'text-stone-800 dark:text-brand-sand',
      borderFocus: 'hover:border-brand-sand',
    },
    neutral: {
      iconBg: 'bg-surface-secondary',
      iconColor: 'text-content-secondary',
      borderFocus: 'hover:border-boundary-strong',
    },
  };

  const { iconBg, iconColor, borderFocus } = accentStyles[accent];

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`bg-surface border border-boundary-subtle rounded-xl p-4 shadow-sm transition-all duration-150 flex items-start gap-3 ${
        onClick ? `cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${borderFocus}` : ''
      } ${className}`}
    >
      {icon && (
        <div
          className={`w-11 h-11 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0 transition-colors`}
        >
          {icon}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-content-muted truncate">
          {label}
        </div>
        <div className="text-lg sm:text-xl font-bold text-content-primary font-tabular tracking-tight mt-1 truncate">
          {value}
        </div>

        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-1.5 text-xs">
            {trend && (
              <span
                className={`font-semibold font-tabular text-[11px] ${
                  trend.neutral
                    ? 'text-content-muted'
                    : trend.isPositive
                    ? 'text-status-success'
                    : 'text-status-danger'
                }`}
              >
                {trend.value}
              </span>
            )}
            {subtitle && (
              <span className="text-content-secondary text-[11px] truncate">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
