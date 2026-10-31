// OWNER: FE-1
// PURPOSE: Product creation and editing form with dynamic variant rows and live price preview

'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Product } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  type: z.string().min(1, 'Product type is required'),
  salesPrice: z.coerce.number().min(0, 'Sales price must be 0 or greater'),
  costPrice: z.coerce.number().min(0, 'Cost price must be 0 or greater'),
  notes: z.string().optional().nullable(),
  variants: z
    .array(
      z.object({
        attribute: z.string().min(1, 'Attribute is required (e.g. Brand)'),
        value: z.string().min(1, 'Value is required (e.g. Odoo)'),
        extraPrice: z.coerce.number().min(0, 'Extra price must be 0 or greater').default(0),
      })
    )
    .optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export interface ProductFormProps {
  initialData?: Product | null;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isLoading?: boolean;
  readOnly?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  readOnly = false,
}) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || 'Service',
      salesPrice: initialData?.salesPrice ? Number(initialData.salesPrice) : 0,
      costPrice: initialData?.costPrice ? Number(initialData.costPrice) : 0,
      notes: initialData?.notes || '',
      variants: initialData?.variants?.map((v) => ({
        attribute: v.attribute,
        value: v.value,
        extraPrice: Number(v.extraPrice || 0),
      })) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  });

  const salesPrice = watch('salesPrice') || 0;
  const currentVariants = watch('variants') || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Product Name"
          placeholder="e.g. BrightERP Pro"
          error={errors.name?.message}
          disabled={readOnly}
          {...register('name')}
        />

        <Input
          label="Type / Category"
          placeholder="e.g. Software, Service, License"
          error={errors.type?.message}
          disabled={readOnly}
          {...register('type')}
        />

        <Input
          label="Sales Price ($)"
          type="number"
          step="0.01"
          placeholder="0.00"
          error={errors.salesPrice?.message}
          disabled={readOnly}
          {...register('salesPrice')}
        />

        <Input
          label="Cost Price ($)"
          type="number"
          step="0.01"
          placeholder="0.00"
          error={errors.costPrice?.message}
          disabled={readOnly}
          {...register('costPrice')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
        <textarea
          rows={3}
          disabled={readOnly}
          placeholder="Optional notes or specifications"
          className="w-full rounded-md border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
          {...register('notes')}
        />
      </div>

      {/* Dynamic Variants Section */}
      <div className="border-t border-slate-200 pt-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Product Variants</h3>
            <p className="text-xs text-slate-500">
              Attributes that add an extra price (e.g. Attribute: Brand, Value: Odoo, Extra: 560)
            </p>
          </div>
          {!readOnly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ attribute: '', value: '', extraPrice: 0 })}
            >
              + Add Variant
            </Button>
          )}
        </div>

        {fields.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">No variants defined for this product.</p>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => {
              const extra = currentVariants[index]?.extraPrice || 0;
              const finalPrice = Number(salesPrice) + Number(extra);

              return (
                <div
                  key={field.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex-1 w-full sm:w-auto">
                    <Input
                      placeholder="Attribute (e.g. Brand)"
                      disabled={readOnly}
                      error={errors.variants?.[index]?.attribute?.message}
                      {...register(`variants.${index}.attribute`)}
                    />
                  </div>

                  <div className="flex-1 w-full sm:w-auto">
                    <Input
                      placeholder="Value (e.g. Odoo)"
                      disabled={readOnly}
                      error={errors.variants?.[index]?.value?.message}
                      {...register(`variants.${index}.value`)}
                    />
                  </div>

                  <div className="w-full sm:w-32">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Extra $"
                      disabled={readOnly}
                      error={errors.variants?.[index]?.extraPrice?.message}
                      {...register(`variants.${index}.extraPrice`)}
                    />
                  </div>

                  {/* Live price preview */}
                  <div className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-2 rounded whitespace-nowrap">
                    Preview: ${Number(salesPrice).toFixed(2)} + ${Number(extra).toFixed(2)} = ${finalPrice.toFixed(2)}
                  </div>

                  {!readOnly && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-rose-500 hover:text-rose-700 self-center"
                    >
                      &times;
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {initialData ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      )}
    </form>
  );
};
