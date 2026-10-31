// OWNER: FE-2
// PURPOSE: Create new subscription page

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSubscription } from '../../../../services/subscriptions.service';
import { SubscriptionForm } from '../../../../components/subscriptions/SubscriptionForm';
import { useToast } from '../../../../components/ui/Toast';

export default function NewSubscriptionPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const created = await createSubscription(data);
      success('Subscription created successfully');
      router.push(`/subscriptions/${created.id}`);
    } catch (err: any) {
      error(err.message || 'Failed to create subscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Link href="/subscriptions" className="text-sm font-medium text-slate-500 hover:text-slate-800">
          &larr; Back to Subscriptions
        </Link>
        <span className="text-slate-300">/</span>
        <h1 className="text-xl font-bold text-slate-900">Create Subscription</h1>
      </div>

      <SubscriptionForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
