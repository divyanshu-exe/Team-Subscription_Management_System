// OWNER: FE-1
// PURPOSE: Role-based access control guard rendering 403 Forbidden when unauthorized

'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../types';
import { Spinner } from '../ui/Spinner';

export interface RoleGuardProps {
  roles: Role[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ roles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  if (!user || !roles.includes(user.role)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="rounded-full bg-rose-100 p-4 text-rose-600 mb-4">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">403 - Forbidden</h2>
        <p className="mt-2 text-sm text-slate-500 max-w-sm">
          You do not have administrative permission to view this section.
        </p>
        <Link
          href={user?.role === 'CUSTOMER' ? '/my-subscriptions' : '/dashboard'}
          className="mt-6 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};
