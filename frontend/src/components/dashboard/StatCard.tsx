// OWNER: FE-2
// PURPOSE: Metric card for financial KPI indicators

import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: {
    text: string;
    variant: 'success' | 'danger' | 'warning' | 'info' | 'default';
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  badge,
  className = '',
}) => {
  const badgeClasses = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div
      className={`bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-3 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {badge && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClasses[badge.variant]}`}
          >
            {badge.text}
          </span>
        )}
      </div>

      <div>
        <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</div>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};
