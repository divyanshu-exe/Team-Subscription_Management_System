// OWNER: FE-1
// PURPOSE: Reusable status and attribute Badge component

import React from 'react';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  status?: string;
  label?: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  status,
  label,
  size = 'md',
  className = '',
}) => {
  let resolvedVariant = variant || 'default';

  if (status && !variant) {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
      case 'PAID':
        resolvedVariant = 'success';
        break;
      case 'CONFIRMED':
        resolvedVariant = 'info';
        break;
      case 'QUOTATION':
        resolvedVariant = 'purple';
        break;
      case 'CLOSED':
      case 'CANCELLED':
        resolvedVariant = 'danger';
        break;
      case 'MONTHLY':
      case 'YEARLY':
      case 'WEEKLY':
      case 'DAILY':
        resolvedVariant = 'info';
        break;
      default:
        resolvedVariant = 'default';
        break;
    }
  }

  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
  };

  const content = label !== undefined ? label : children;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeClasses[size]} ${variantClasses[resolvedVariant]} ${className}`}
    >
      {content}
    </span>
  );
};
