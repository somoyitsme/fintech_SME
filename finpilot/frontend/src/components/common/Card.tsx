import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverable = false, ...props }) => {
  return (
    <div
      className={`bg-surface border border-boundary-subtle rounded-xl shadow-sm transition-colors duration-150 ${
        hoverable ? 'hover:border-boundary-strong cursor-pointer hover:shadow-md' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={`px-4 sm:px-5 py-4 border-b border-boundary-subtle flex items-start justify-between gap-3 ${className}`}>
      <div>
        <h3 className="text-sm sm:text-base font-semibold text-content-primary tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-content-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`p-4 sm:p-5 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
    return <div className={`px-4 py-3 sm:px-5 sm:py-4 border-t border-boundary-subtle bg-surface-secondary/50 rounded-b-xl flex items-center justify-between gap-3 ${className}`}>{children}</div>;
};
