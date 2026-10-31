// OWNER: FE-1
// PURPOSE: Global top header showing current user details, role badge, and logout

'use client';

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface TopbarProps {
  title?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ title }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-slate-800">{title || 'Brightloop Subscriptions'}</h1>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-slate-900">{user.name}</div>
              <div className="text-xs text-slate-400">{user.email}</div>
            </div>
            <Badge status={user.role} label={user.role} size="sm" />
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-xs text-slate-600 hover:text-rose-600 ml-2"
            >
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
