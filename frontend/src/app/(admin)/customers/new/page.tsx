// OWNER: FE-1
// PURPOSE: Create customer page

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerForm } from '../../../../components/forms/CustomerForm';
import { createCustomer } from '../../../../services/customers.service';
import { useToast } from '../../../../components/ui/Toast';

export default function NewCustomerPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      await createCustomer(data);
      addToast('Customer created successfully', 'success');
      router.push('/customers');
    } catch (err: any) {
      addToast(err.message || 'Failed to create customer', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Customer</h1>
        <p className="text-sm text-slate-500">Record a new client profile for subscriptions and invoices</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <CustomerForm onSubmit={handleSubmit} isLoading={loading} />
      </div>
    </div>
  );
}
