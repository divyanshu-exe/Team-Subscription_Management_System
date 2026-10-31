// OWNER: FE-1
// PURPOSE: Staff accounts administration list page (ADMIN only)

'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { listStaff, updateStaff } from '../../../services/users.service';
import { User } from '../../../types';
import { DataTable, Column } from '../../../components/tables/DataTable';
import { formatDate } from '../../../lib/format';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { RoleGuard } from '../../../components/layout/RoleGuard';
import { useToast } from '../../../components/ui/Toast';

export default function StaffPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const handleToggleActive = async (u: User) => {
    try {
      await updateStaff(u.id, { isActive: !u.isActive });
      addToast(`Staff account ${u.isActive ? 'deactivated' : 'activated'}`, 'success');
      router.refresh();
    } catch (err: any) {
      addToast(err.message || 'Failed to update account status', 'error');
    }
  };

  const columns: Column<User>[] = [
    {
      header: 'Staff Member',
      accessor: (u) => (
        <div>
          <span className="font-semibold text-slate-900">{u.name}</span>
          <p className="text-xs text-slate-400">{u.email}</p>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: (u) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
          {u.role}
        </span>
      ),
    },
    {
      header: 'Joined',
      accessor: (u) => <span className="text-xs text-slate-600">{formatDate(u.createdAt)}</span>,
    },
    {
      header: 'Status',
      accessor: (u) => (
        <Badge variant={u.isActive ? 'success' : 'danger'}>
          {u.isActive ? 'Active' : 'Disabled'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: (u) => (
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleToggleActive(u)}
            className={`text-xs font-medium ${
              u.isActive ? 'text-amber-600 hover:text-amber-800' : 'text-emerald-600 hover:text-emerald-800'
            }`}
          >
            {u.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <RoleGuard roles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
            <p className="text-sm text-slate-500">Manage internal operator accounts and access permissions</p>
          </div>
          <Link href="/staff/new">
            <Button variant="primary">Add Staff Member</Button>
          </Link>
        </div>

        <DataTable<User>
          columns={columns}
          fetcher={listStaff}
          emptyMessage="No staff members found."
        />
      </div>
    </RoleGuard>
  );
}
