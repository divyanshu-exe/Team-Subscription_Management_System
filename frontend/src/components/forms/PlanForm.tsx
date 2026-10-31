// OWNER: FE-1
// PURPOSE: Plan creation and editing form with 4 policy toggles and date constraints

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plan } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

const planSchema = z
  .object({
    name: z.string().min(1, 'Plan name is required'),
    price: z.coerce.number().min(0, 'Price must be 0 or greater'),
    period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
    minQuantity: z.coerce.number().int().min(1, 'Minimum quantity must be at least 1').default(1),
    availableFrom: z.string().min(1, 'Available from date is required'),
    availableTo: z.string().min(1, 'Available to date is required'),
    autoCloseAtEnd: z.boolean().default(false),
    closableEarly: z.boolean().default(false),
    pausable: z.boolean().default(false),
    renewable: z.boolean().default(false),
  })
  .refine((data) => new Date(data.availableTo) >= new Date(data.availableFrom), {
    message: 'Available to date must be on or after available from date',
    path: ['availableTo'],
  });

type PlanFormData = z.infer<typeof planSchema>;

export interface PlanFormProps {
  initialData?: Plan | null;
  onSubmit: (data: PlanFormData) => Promise<void>;
  isLoading?: boolean;
  readOnly?: boolean;
}

export const PlanForm: React.FC<PlanFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  readOnly = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: initialData?.name || '',
      price: initialData?.price ? Number(initialData.price) : 0,
      period: initialData?.period || 'MONTHLY',
      minQuantity: initialData?.minQuantity || 1,
      availableFrom: initialData?.availableFrom ? initialData.availableFrom.split('T')[0] : '',
      availableTo: initialData?.availableTo ? initialData.availableTo.split('T')[0] : '',
      autoCloseAtEnd: Boolean(initialData?.autoCloseAtEnd),
      closableEarly: Boolean(initialData?.closableEarly),
      pausable: Boolean(initialData?.pausable),
      renewable: Boolean(initialData?.renewable),
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Plan Name"
          placeholder="e.g. Standard Monthly"
          error={errors.name?.message}
          disabled={readOnly}
          {...register('name')}
        />

        <Input
          label="Base Price ($)"
          type="number"
          step="0.01"
          placeholder="0.00"
          error={errors.price?.message}
          disabled={readOnly}
          {...register('price')}
        />

        <Select
          label="Billing Period"
          disabled={readOnly}
          error={errors.period?.message}
          options={[
            { value: 'DAILY', label: 'Daily' },
            { value: 'WEEKLY', label: 'Weekly' },
            { value: 'MONTHLY', label: 'Monthly' },
            { value: 'YEARLY', label: 'Yearly' },
          ]}
          {...register('period')}
        />

        <Input
          label="Minimum Order Quantity"
          type="number"
          min="1"
          error={errors.minQuantity?.message}
          disabled={readOnly}
          {...register('minQuantity')}
        />

        <Input
          label="Available From"
          type="date"
          error={errors.availableFrom?.message}
          disabled={readOnly}
          {...register('availableFrom')}
        />

        <Input
          label="Available To"
          type="date"
          error={errors.availableTo?.message}
          disabled={readOnly}
          {...register('availableTo')}
        />
      </div>

      {/* 4 Policy Flags Section */}
      <div className="border-t border-slate-200 pt-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Plan Policy Rules</h3>
        <p className="text-xs text-slate-500 mb-4">
          Control operational rules and lifecycle capabilities for subscriptions linked to this plan
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              disabled={readOnly}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              {...register('autoCloseAtEnd')}
            />
            <div>
              <span className="text-sm font-medium text-slate-800">Auto-Close at End</span>
              <p className="text-xs text-slate-500">Automatically transitions to Closed once expiryDate passes</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              disabled={readOnly}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              {...register('closableEarly')}
            />
            <div>
              <span className="text-sm font-medium text-slate-800">Closable Early</span>
              <p className="text-xs text-slate-500">Allows sales rep or admin to terminate before expiry date</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              disabled={readOnly}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              {...register('pausable')}
            />
            <div>
              <span className="text-sm font-medium text-slate-800">Pausable</span>
              <p className="text-xs text-slate-500">Allows pausing recurring billing engine invoices</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              disabled={readOnly}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              {...register('renewable')}
            />
            <div>
              <span className="text-sm font-medium text-slate-800">Renewable</span>
              <p className="text-xs text-slate-500">Allows extending subscription by one full billing cycle</p>
            </div>
          </label>
        </div>
      </div>

      {!readOnly && (
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {initialData ? 'Update Plan' : 'Create Plan'}
          </Button>
        </div>
      )}
    </form>
  );
};
