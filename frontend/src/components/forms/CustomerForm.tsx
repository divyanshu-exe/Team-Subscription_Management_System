// OWNER: FE-1
// PURPOSE: Customer create and edit form (ADMIN and STAFF)

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Customer } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export interface CustomerFormProps {
  initialData?: Customer | null;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  isLoading?: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      company: initialData?.company || '',
      address: initialData?.address || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Customer Name"
          placeholder="e.g. John Doe"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="john@acmecorp.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Company / Organization"
          placeholder="e.g. Acme Corporation"
          error={errors.company?.message}
          {...register('company')}
        />

        <Input
          label="Phone Number"
          placeholder="+1 555-0199"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <div className="md:col-span-2">
          <Input
            label="Billing Address"
            placeholder="123 Innovation Way, Suite 400"
            error={errors.address?.message}
            {...register('address')}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Customer' : 'Create Customer'}
        </Button>
      </div>
    </form>
  );
};
