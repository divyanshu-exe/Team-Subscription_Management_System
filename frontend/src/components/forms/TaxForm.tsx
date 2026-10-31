// OWNER: FE-1
// PURPOSE: Tax rule form with percentage/fixed validation

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tax } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

const taxSchema = z
  .object({
    name: z.string().min(1, 'Tax name is required'),
    type: z.enum(['PERCENT', 'FIXED']),
    value: z.coerce.number().min(0, 'Value must be 0 or greater'),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.type === 'PERCENT') {
        return data.value <= 100;
      }
      return true;
    },
    {
      message: 'Percentage value must be between 0 and 100',
      path: ['value'],
    }
  );

type TaxFormData = z.infer<typeof taxSchema>;

export interface TaxFormProps {
  initialData?: Tax | null;
  onSubmit: (data: TaxFormData) => Promise<void>;
  isLoading?: boolean;
  readOnly?: boolean;
}

export const TaxForm: React.FC<TaxFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  readOnly = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TaxFormData>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || 'PERCENT',
      value: initialData?.value ? Number(initialData.value) : 0,
      isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    },
  });

  const selectedType = watch('type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Tax Name"
          placeholder="e.g. GST 18%, VAT 5%"
          error={errors.name?.message}
          disabled={readOnly}
          {...register('name')}
        />

        <Select
          label="Calculation Type"
          disabled={readOnly}
          error={errors.type?.message}
          options={[
            { value: 'PERCENT', label: 'Percentage (%)' },
            { value: 'FIXED', label: 'Fixed Amount ($)' },
          ]}
          {...register('type')}
        />

        <Input
          label={selectedType === 'PERCENT' ? 'Rate (%)' : 'Amount ($)'}
          type="number"
          step="0.01"
          placeholder="0.00"
          error={errors.value?.message}
          disabled={readOnly}
          {...register('value')}
        />
      </div>

      {!readOnly && (
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {initialData ? 'Update Tax Rule' : 'Create Tax Rule'}
          </Button>
        </div>
      )}
    </form>
  );
};
