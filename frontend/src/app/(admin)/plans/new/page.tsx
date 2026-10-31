// OWNER: FE-1
// PURPOSE: Create new subscription plan page (ADMIN only)

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createPlan } from '../../../../services/plans.service';
import { PlanForm } from '../../../../components/forms/PlanForm';
import { useToast } from '../../../../components/ui/Toast';
import { RoleGuard } from '../../../../components/layout/RoleGuard';

export default function NewPlanPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await createPlan(data);
      success('Subscription plan created successfully');
      router.push('/plans');
    } catch (err: any) {
      error(err.message || 'Failed to create plan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RoleGuard roles={['ADMIN']}>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <Link href="/plans" className="text-sm font-medium text-slate-500 hover:text-slate-800">
            &larr; Back to Plans
          </Link>
          <span className="text-slate-300">/</span>
          <h1 className="text-xl font-bold text-slate-900">New Subscription Plan</h1>
        </div>

        <PlanForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </RoleGuard>
  );
}
