// OWNER: FE-1
// PURPOSE: Edit discount page (ADMIN only)

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { RoleGuard } from '../../../../components/layout/RoleGuard';
import { DiscountForm } from '../../../../components/forms/DiscountForm';
import { getDiscount, updateDiscount } from '../../../../services/discounts.service';
import { Discount } from '../../../../types';
import { useToast } from '../../../../components/ui/Toast';
import { Spinner } from '../../../../components/ui/Spinner';

export default function EditDiscountPage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getDiscount(params.id as string);
        setDiscount(data);
      } catch (err: any) {
        addToast(err.message || 'Failed to load discount', 'error');
        router.push('/discounts');
      } finally {
        setLoading(false);
      }
    }
    if (params.id) load();
  }, [params.id, router, addToast]);

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      await updateDiscount(params.id as string, data);
      addToast('Discount updated successfully', 'success');
      router.push('/discounts');
    } catch (err: any) {
      addToast(err.message || 'Failed to update discount', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <RoleGuard roles={['ADMIN']}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Discount</h1>
          <p className="text-sm text-slate-500">Update parameters for {discount?.name}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <DiscountForm initialData={discount} onSubmit={handleSubmit} isLoading={submitting} />
        </div>
      </div>
    </RoleGuard>
  );
}
