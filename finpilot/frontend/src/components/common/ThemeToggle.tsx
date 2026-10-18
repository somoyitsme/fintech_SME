import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme, ThemeMode } from '../../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'buttons' | 'cycle' | 'dropdown';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'buttons', className = '' }) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (variant === 'cycle') {
    return (
      <button
        onClick={toggleTheme}
        className={`p-1.5 rounded-lg text-content-secondary hover:text-content-primary hover:bg-surface-secondary border border-boundary-subtle transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-ochre ${className}`}
        title={`Current theme: ${theme} (Click to toggle)`}
        aria-label="Toggle theme"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-4 h-4 text-brand-ochre" />
        ) : (
          <Sun className="w-4 h-4 text-brand-ochre" />
        )}
      </button>
    );
  }

  const modes: { id: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { id: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5" /> },
    { id: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" /> },
    { id: 'system', label: 'System', icon: <Laptop className="w-3.5 h-3.5" /> },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Theme mode"
      className={`inline-flex items-center p-0.5 rounded-lg bg-surface-secondary border border-boundary-subtle ${className}`}
    >
      {modes.map((mode) => {
        const isActive = theme === mode.id;
        return (
          <button
            key={mode.id}
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(mode.id)}
            title={`Switch to ${mode.label} theme`}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-150 ${
              isActive
                ? 'bg-surface text-content-primary shadow-sm font-semibold border border-boundary-subtle'
                : 'text-content-muted hover:text-content-secondary hover:bg-surface-hover'
            }`}
          >
            <span className={isActive ? 'text-brand-ochreDeep dark:text-brand-ochre' : 'text-content-muted'}>
              {mode.icon}
            </span>
            <span className="hidden sm:inline text-[11px]">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
};
