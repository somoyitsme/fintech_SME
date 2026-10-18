import React from 'react';

interface DataTableProps {
  children: React.ReactNode;
  className?: string;
  isEmpty?: boolean;
  emptyMessage?: React.ReactNode;
}

export const DataTable: React.FC<DataTableProps> = ({
  children,
  className = '',
  isEmpty = false,
  emptyMessage = 'No records found matching criteria.',
}) => {
  return (
    <div className={`w-full bg-surface border border-boundary-subtle rounded-xl shadow-sm overflow-hidden ${className}`}>
      <div className="w-full overflow-x-auto scrollbar-thin">
        <table className="enterprise-table w-full text-left text-xs sm:text-sm border-collapse min-w-[720px]">
          {children}
        </table>
      </div>

      {isEmpty && (
        <div className="p-8 text-center text-xs text-content-muted border-t border-boundary-subtle bg-surface-secondary/30">
          {emptyMessage}
        </div>
      )}
    </div>
  );
};

export const TableHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <thead className={`bg-surface-secondary border-b border-boundary-subtle text-[11px] font-semibold text-content-muted tracking-wide ${className}`}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <tbody className={`divide-y divide-boundary-subtle ${className}`}>{children}</tbody>;
};

export const TableRow: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  highlighted?: boolean;
}> = ({ children, onClick, className = '', highlighted = false }) => {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors duration-150 ${
        highlighted ? 'bg-brand-olive/15 dark:bg-brand-olive/10' : ''
      } ${
        onClick
          ? 'hover:bg-surface-hover cursor-pointer active:bg-surface-tertiary/50'
          : 'hover:bg-surface-hover/70'
      } ${className}`}
    >
      {children}
    </tr>
  );
};

export const TableHeadCell: React.FC<{
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}> = ({ children, align = 'left', className = '' }) => {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <th className={`py-3.5 px-3 sm:px-4 font-semibold select-none ${alignClass} ${className}`}>
      {children}
    </th>
  );
};

export const TableCell: React.FC<{
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  tabular?: boolean;
  className?: string;
}> = ({ children, align = 'left', tabular = false, className = '' }) => {
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <td
      className={`py-3.5 px-3 sm:px-4 text-content-primary align-middle ${alignClass} ${
        tabular ? 'font-tabular' : ''
      } ${className}`}
    >
      {children}
    </td>
  );
};
