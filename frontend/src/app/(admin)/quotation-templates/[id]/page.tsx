// OWNER: FE-2
// PURPOSE: Edit quotation template page

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { QuotationTemplateForm } from '../../../../components/forms/QuotationTemplateForm';
import {
  getQuotationTemplate,
  updateQuotationTemplate,
} from '../../../../services/quotation-templates.service';
import { QuotationTemplate } from '../../../../types';
import { useToast } from '../../../../components/ui/Toast';
import { Spinner } from '../../../../components/ui/Spinner';

export default function EditQuotationTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const [template, setTemplate] = useState<QuotationTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getQuotationTemplate(params.id as string);
        setTemplate(data);
      } catch (err: any) {
        addToast(err.message || 'Failed to load quotation template', 'error');
        router.push('/quotation-templates');
      } finally {
        setLoading(false);
      }
    }
    if (params.id) load();
  }, [params.id, router, addToast]);

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      await updateQuotationTemplate(params.id as string, data);
      addToast('Quotation template updated successfully', 'success');
      router.push('/quotation-templates');
    } catch (err: any) {
      addToast(err.message || 'Failed to update quotation template', 'error');
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Quotation Template</h1>
        <p className="text-sm text-slate-500">Update preset bundle {template?.name}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <QuotationTemplateForm
          initialData={template}
          onSubmit={handleSubmit}
          isLoading={submitting}
        />
      </div>
    </div>
  );
}
