// OWNER: FE-1
// PURPOSE: Create new staff account page (ADMIN only)

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '../../../../components/layout/RoleGuard';
import { StaffForm } from '../../../../components/forms/StaffForm';
import { createStaff } from '../../../../services/users.service';
import { useToast } from '../../../../components/ui/Toast';

export default function NewStaffPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      await createStaff(data);
      addToast('Staff member added successfully', 'success');
      router.push('/staff');
    } catch (err: any) {
      addToast(err.message || 'Failed to create staff member', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard roles={['ADMIN']}>
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Staff Member</h1>
          <p className="text-sm text-slate-500">Create operator account with 9+ character password</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <StaffForm onSubmit={handleSubmit} isLoading={loading} />
        </div>
      </div>
    </RoleGuard>
  );
}
