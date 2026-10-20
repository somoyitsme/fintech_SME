import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className = '',
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, currentPage * pageSize);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-3.5 pb-1 px-2 border-t border-boundary-subtle text-xs select-none ${className}`}>
      {/* Left: Summary and Page Size */}
      <div className="flex flex-wrap items-center gap-3 text-content-muted">
        <span>
          Showing <span className="font-semibold text-content-primary font-tabular">{startItem}</span> to{' '}
          <span className="font-semibold text-content-primary font-tabular">{endItem}</span> of{' '}
          <span className="font-semibold text-content-primary font-tabular">{totalItems}</span> entries
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="bg-surface border border-boundary-strong text-content-primary rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-ochre cursor-pointer font-tabular"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page navigation buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 px-2 text-content-secondary hover:text-content-primary disabled:opacity-40"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span>Prev</span>
        </Button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 text-content-muted">
                  ...
                </span>
              );
            }

            const isCurrent = page === currentPage;
            return (
              <button
                key={`page-${page}`}
                type="button"
                onClick={() => onPageChange(page as number)}
                className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold transition-all font-tabular ${
                  isCurrent
                    ? 'bg-brand-ochre text-stone-950 shadow-xs'
                    : 'text-content-secondary hover:text-content-primary hover:bg-surface-secondary border border-transparent hover:border-boundary-subtle'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 px-2 text-content-secondary hover:text-content-primary disabled:opacity-40"
          aria-label="Next Page"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
