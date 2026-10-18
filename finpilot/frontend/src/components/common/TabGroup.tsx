import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number | string;
  icon?: React.ReactNode;
}

interface TabGroupProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const TabGroup: React.FC<TabGroupProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`w-full overflow-x-auto scrollbar-none pb-1 ${className}`}>
      <div
        role="tablist"
        className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-surface-secondary/70 border border-boundary-subtle min-w-max"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 select-none ${
                isActive
                  ? 'bg-surface text-stone-900 dark:text-[#F5F5F0] font-bold shadow-xs border border-boundary-subtle ring-1 ring-brand-ochre/30'
                  : 'text-content-muted hover:text-content-primary hover:bg-surface-hover'
              }`}
            >
              {tab.icon && (
                <span className={isActive ? 'text-brand-ochreDeep dark:text-brand-ochre' : 'text-content-muted'}>
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-tabular ${
                    isActive
                      ? 'bg-brand-sage/40 text-stone-900 dark:bg-brand-sage/20 dark:text-brand-sage font-bold'
                      : 'bg-surface-secondary text-content-muted'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
