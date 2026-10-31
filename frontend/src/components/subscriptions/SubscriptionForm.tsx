// OWNER: FE-2
// PURPOSE: Subscription creation and editing form with template loader & line item validation

'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Subscription, Customer, Plan, QuotationTemplate, Product, Tax } from '../../types';
import { listCustomers } from '../../services/customers.service';
import { listPlans } from '../../services/plans.service';
import { listQuotationTemplates } from '../../services/quotation-templates.service';
import { listProducts } from '../../services/products.service';
import { listTaxes } from '../../services/taxes.service';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { LineItemsEditor, EditableLineItem } from './LineItemsEditor';

const subscriptionSchema = z
  .object({
    customerId: z.coerce.number().int().min(1, 'Customer is required'),
    planId: z.coerce.number().int().min(1, 'Plan is required'),
    templateId: z.coerce.number().int().optional().nullable(),
    startDate: z.string().min(1, 'Start date is required'),
    expiryDate: z.string().min(1, 'Expiry date is required'),
    paymentTerms: z.string().min(1, 'Payment terms is required'),
    paymentTermsDays: z.coerce.number().int().min(0).default(15),
  })
  .refine((data) => new Date(data.expiryDate) > new Date(data.startDate), {
    message: 'Expiry date must be after start date',
    path: ['expiryDate'],
  });

type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

export interface SubscriptionFormProps {
  initialData?: Subscription | null;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [templates, setTemplates] = useState<QuotationTemplate[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [lineItems, setLineItems] = useState<EditableLineItem[]>(
    initialData?.lines?.map((l) => ({
      productId: l.productId,
      variantId: l.variantId,
      quantity: l.quantity,
      taxId: l.taxId,
    })) || []
  );

  useEffect(() => {
    async function loadData() {
      try {
        const [custRes, plansRes, tempRes, prodRes, taxesRes] = await Promise.all([
          listCustomers({ limit: 100 }),
          listPlans({ active: true }),
          listQuotationTemplates(),
          listProducts({ limit: 100 }),
          listTaxes(),
        ]);
        setCustomers(custRes.items || []);
        setPlans(plansRes || []);
        setTemplates(Array.isArray(tempRes) ? tempRes : (tempRes as any).items || []);
        setProducts(prodRes.items || []);
        setTaxes(taxesRes || []);
      } catch {
        // absorb
      }
    }
    loadData();
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      customerId: initialData?.customerId || 0,
      planId: initialData?.planId || 0,
      templateId: initialData?.templateId || null,
      startDate: initialData?.startDate ? initialData.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
      expiryDate: initialData?.expiryDate ? initialData.expiryDate.split('T')[0] : '',
      paymentTerms: initialData?.paymentTermsLabel || 'Net 15',
      paymentTermsDays: initialData?.paymentTermsDays || 15,
    },
  });

  const selectedPlanId = watch('planId');
  const selectedPlan = plans.find((p) => Number(p.id) === Number(selectedPlanId));
  const minQuantity = selectedPlan?.minQuantity || 1;

  // Handle template selection to auto-populate lines
  const handleTemplateChange = (templateIdVal: string) => {
    if (!templateIdVal) return;
    const tId = Number(templateIdVal);
    const tmpl = templates.find((t) => t.id === tId);
    if (tmpl) {
      setValue('planId', tmpl.planId);
      if (tmpl.lines && tmpl.lines.length > 0) {
        setLineItems(
          tmpl.lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            quantity: l.quantity,
            taxId: null,
          }))
        );
      }
    }
  };

  const handleFormSubmit = async (formData: SubscriptionFormData) => {
    // Validate line quantities against plan minimum
    for (const l of lineItems) {
      if (l.quantity < minQuantity) {
        alert(`Line quantity (${l.quantity}) cannot be less than plan minimum (${minQuantity})`);
        return;
      }
    }

    if (lineItems.length === 0) {
      alert('Please add at least one line item');
      return;
    }

    await onSubmit({
      ...formData,
      lines: lineItems,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 bg-white p-6 rounded-xl border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Template Selector */}
        {!initialData && (
          <div className="md:col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <Select
              label="Start from Template (Optional)"
              options={[
                { value: '', label: 'Select a template to pre-fill lines...' },
                ...templates.map((t) => ({ value: t.id, label: t.name })),
              ]}
              onChange={(e) => {
                setValue('templateId', e.target.value ? Number(e.target.value) : null);
                handleTemplateChange(e.target.value);
              }}
            />
          </div>
        )}

        <Select
          label="Customer"
          error={errors.customerId?.message}
          options={[
            { value: '', label: 'Select Customer...' },
            ...customers.map((c) => ({ value: c.id, label: `${c.name} (${c.email})` })),
          ]}
          {...register('customerId')}
        />

        <Select
          label="Subscription Plan"
          error={errors.planId?.message}
          options={[
            { value: '', label: 'Select Plan...' },
            ...plans.map((p) => ({
              value: p.id,
              label: `${p.name} ($${Number(p.price).toFixed(2)} / ${p.period.toLowerCase()}, min qty: ${p.minQuantity})`,
            })),
          ]}
          {...register('planId')}
        />

        <Input
          label="Start Date"
          type="date"
          error={errors.startDate?.message}
          {...register('startDate')}
        />

        <Input
          label="Expiry Date"
          type="date"
          error={errors.expiryDate?.message}
          {...register('expiryDate')}
        />

        <Select
          label="Payment Terms"
          error={errors.paymentTerms?.message}
          options={[
            { value: 'Immediate', label: 'Immediate Payment' },
            { value: 'Net 15', label: 'Net 15 Days' },
            { value: 'Net 30', label: 'Net 30 Days' },
          ]}
          onChange={(e) => {
            const val = e.target.value;
            setValue('paymentTerms', val);
            if (val === 'Immediate') setValue('paymentTermsDays', 0);
            if (val === 'Net 15') setValue('paymentTermsDays', 15);
            if (val === 'Net 30') setValue('paymentTermsDays', 30);
          }}
        />

        <Input
          label="Payment Due Window (Days)"
          type="number"
          min="0"
          error={errors.paymentTermsDays?.message}
          {...register('paymentTermsDays')}
        />
      </div>

      {/* Embedded LineItemsEditor */}
      <div className="border-t border-slate-200 pt-5">
        <LineItemsEditor
          lines={lineItems}
          onChange={setLineItems}
          products={products}
          taxes={taxes}
          minQuantity={minQuantity}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Subscription' : 'Create Subscription'}
        </Button>
      </div>
    </form>
  );
};
