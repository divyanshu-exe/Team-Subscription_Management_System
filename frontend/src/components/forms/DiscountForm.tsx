// OWNER: FE-1
// PURPOSE: Discount creation/editing form with conditional product selection (ADMIN only)

'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Discount, Product } from '../../types';
import { listProducts } from '../../services/products.service';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

const discountSchema = z
  .object({
    name: z.string().min(1, 'Discount name is required'),
    type: z.enum(['FIXED', 'PERCENT']),
    value: z.coerce.number().min(0.01, 'Value must be greater than 0'),
    minPurchase: z.coerce.number().min(0).optional().nullable(),
    minQuantity: z.coerce.number().int().min(1).optional().nullable(),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    usageLimit: z.coerce.number().int().min(1, 'Usage limit must be at least 1'),
    appliesTo: z.enum(['PRODUCTS', 'SUBSCRIPTION']),
    productIds: z.array(z.coerce.number()).optional().default([]),
  })
  .refine(
    (data) => {
      if (data.type === 'PERCENT') {
        return data.value <= 100;
      }
      return true;
    },
    {
      message: 'Percentage discount cannot exceed 100%',
      path: ['value'],
    }
  )
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  })
  .refine(
    (data) => {
      if (data.appliesTo === 'PRODUCTS') {
        return Array.isArray(data.productIds) && data.productIds.length > 0;
      }
      return true;
    },
    {
      message: 'Select at least one product when applying to specific products',
      path: ['productIds'],
    }
  );

type DiscountFormData = z.infer<typeof discountSchema>;

export interface DiscountFormProps {
  initialData?: Discount | null;
  onSubmit: (data: DiscountFormData) => Promise<void>;
  isLoading?: boolean;
}

export const DiscountForm: React.FC<DiscountFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await listProducts({ limit: 100 });
        setAvailableProducts(res.items || []);
      } catch {
        // absorb
      }
    }
    fetchProducts();
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DiscountFormData>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || 'PERCENT',
      value: initialData?.value ? Number(initialData.value) : 10,
      minPurchase: initialData?.minPurchase ? Number(initialData.minPurchase) : null,
      minQuantity: initialData?.minQuantity || null,
      startDate: initialData?.startDate ? initialData.startDate.split('T')[0] : '',
      endDate: initialData?.endDate ? initialData.endDate.split('T')[0] : '',
      usageLimit: initialData?.usageLimit || 10,
      appliesTo: initialData?.appliesTo || 'SUBSCRIPTION',
      productIds: initialData?.products?.map((p) => p.productId) || initialData?.productIds || [],
    },
  });

  const selectedAppliesTo = watch('appliesTo');
  const selectedProductIds = watch('productIds') || [];

  const handleProductToggle = (productId: number) => {
    const current = [...selectedProductIds];
    const index = current.indexOf(productId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(productId);
    }
    setValue('productIds', current, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Discount Name"
          placeholder="e.g. Summer Promo 20%"
          error={errors.name?.message}
          {...register('name')}
        />

        <Select
          label="Discount Type"
          error={errors.type?.message}
          options={[
            { value: 'PERCENT', label: 'Percentage (%)' },
            { value: 'FIXED', label: 'Fixed Amount ($)' },
          ]}
          {...register('type')}
        />

        <Input
          label="Discount Value"
          type="number"
          step="0.01"
          placeholder="e.g. 15"
          error={errors.value?.message}
          {...register('value')}
        />

        <Input
          label="Usage Limit (Max redemptions)"
          type="number"
          min="1"
          placeholder="e.g. 50"
          error={errors.usageLimit?.message}
          {...register('usageLimit')}
        />

        <Input
          label="Start Date"
          type="date"
          error={errors.startDate?.message}
          {...register('startDate')}
        />

        <Input
          label="End Date"
          type="date"
          error={errors.endDate?.message}
          {...register('endDate')}
        />

        <Input
          label="Min Purchase Amount ($) (Optional)"
          type="number"
          step="0.01"
          placeholder="0.00"
          error={errors.minPurchase?.message}
          {...register('minPurchase')}
        />

        <Input
          label="Min Quantity Required (Optional)"
          type="number"
          min="1"
          placeholder="e.g. 2"
          error={errors.minQuantity?.message}
          {...register('minQuantity')}
        />

        <div className="md:col-span-2">
          <Select
            label="Applies To"
            error={errors.appliesTo?.message}
            options={[
              { value: 'SUBSCRIPTION', label: 'Whole Subscription' },
              { value: 'PRODUCTS', label: 'Specific Products Only' },
            ]}
            {...register('appliesTo')}
          />
        </div>
      </div>

      {/* Conditional Product Multi-Select */}
      {selectedAppliesTo === 'PRODUCTS' && (
        <div className="border-t border-slate-200 pt-4">
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            Select Eligible Products
          </label>
          {errors.productIds?.message && (
            <p className="text-xs text-rose-600 mb-2">{errors.productIds.message}</p>
          )}

          <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 p-3 space-y-2 bg-slate-50">
            {availableProducts.length === 0 ? (
              <p className="text-xs text-slate-400">Loading products...</p>
            ) : (
              availableProducts.map((prod) => {
                const isSelected = selectedProductIds.includes(prod.id);
                return (
                  <label
                    key={prod.id}
                    className="flex items-center gap-3 p-2 bg-white rounded border border-slate-200 cursor-pointer hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleProductToggle(prod.id)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-slate-800">{prod.name}</span>
                    <span className="text-xs text-slate-400 ml-auto">{prod.type}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Discount' : 'Create Discount'}
        </Button>
      </div>
    </form>
  );
};
