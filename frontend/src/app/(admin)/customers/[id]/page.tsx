// OWNER: FE-1
// PURPOSE: Edit customer page

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CustomerForm } from '../../../../components/forms/CustomerForm';
import { getCustomer, updateCustomer } from '../../../../services/customers.service';
import { Customer } from '../../../../types';
import { useToast } from '../../../../components/ui/Toast';
import { Spinner } from '../../../../components/ui/Spinner';

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCustomer(params.id as string);
        setCustomer(data);
      } catch (err: any) {
        addToast(err.message || 'Failed to load customer', 'error');
        router.push('/customers');
      } finally {
        setLoading(false);
      }
    }
    if (params.id) load();
  }, [params.id, router, addToast]);

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      await updateCustomer(params.id as string, data);
      addToast('Customer updated successfully', 'success');
      router.push('/customers');
    } catch (err: any) {
      addToast(err.message || 'Failed to update customer', 'error');
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Customer</h1>
        <p className="text-sm text-slate-500">Update contact and billing details for {customer?.name}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <CustomerForm initialData={customer} onSubmit={handleSubmit} isLoading={submitting} />
      </div>
    </div>
  );
}
