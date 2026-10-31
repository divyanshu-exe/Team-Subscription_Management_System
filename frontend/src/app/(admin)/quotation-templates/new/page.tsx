// OWNER: FE-2
// PURPOSE: Create quotation template page

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuotationTemplateForm } from '../../../../components/forms/QuotationTemplateForm';
import { createQuotationTemplate } from '../../../../services/quotation-templates.service';
import { useToast } from '../../../../components/ui/Toast';

export default function NewQuotationTemplatePage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      await createQuotationTemplate(data);
      addToast('Quotation template created successfully', 'success');
      router.push('/quotation-templates');
    } catch (err: any) {
      addToast(err.message || 'Failed to create quotation template', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Quotation Template</h1>
        <p className="text-sm text-slate-500">Configure pre-bundled products and subscription terms</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <QuotationTemplateForm onSubmit={handleSubmit} isLoading={loading} />
      </div>
    </div>
  );
}
