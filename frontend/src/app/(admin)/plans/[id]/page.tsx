// OWNER: FE-1
// PURPOSE: Plan detail and editing page with delete confirmation modal

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPlan, updatePlan, deletePlan } from '../../../../services/plans.service';
import { Plan } from '../../../../types';
import { PlanForm } from '../../../../components/forms/PlanForm';
import { Spinner } from '../../../../components/ui/Spinner';
import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import { useToast } from '../../../../components/ui/Toast';
import { useAuth } from '../../../../hooks/useAuth';

export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { success, error } = useToast();

  const isAdmin = user?.role === 'ADMIN';
  const planId = params.id as string;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPlan(planId);
        setPlan(data);
      } catch (err: any) {
        error(err.message || 'Plan not found');
        router.push('/plans');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [planId, router, error]);

  const handleUpdate = async (data: any) => {
    setSaving(true);
    try {
      const updated = await updatePlan(planId, data);
      setPlan(updated);
      success('Subscription plan updated successfully');
    } catch (err: any) {
      error(err.message || 'Failed to update plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePlan(planId);
      success('Plan deleted successfully');
      router.push('/plans');
    } catch (err: any) {
      error(err.message || 'Failed to delete plan');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/plans" className="text-sm font-medium text-slate-500 hover:text-slate-800">
            &larr; Plans
          </Link>
          <span className="text-slate-300">/</span>
          <h1 className="text-xl font-bold text-slate-900">{plan.name}</h1>
        </div>

        {isAdmin && (
          <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
            Delete Plan
          </Button>
        )}
      </div>

      <PlanForm
        initialData={plan}
        onSubmit={handleUpdate}
        isLoading={saving}
        readOnly={!isAdmin}
      />

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Plan"
        description="Are you sure you want to deactivate this plan? Existing subscriptions linked to this plan will remain valid."
      >
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" isLoading={deleting} onClick={handleDelete}>
            Confirm Deactivation
          </Button>
        </div>
      </Modal>
    </div>
  );
}
