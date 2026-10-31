// OWNER: FE-2
// PURPOSE: Quotation template creation & editing form with product/variant line items and price preview

'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { QuotationTemplate, Plan, Product } from '../../types';
import { listPlans } from '../../services/plans.service';
import { listProducts } from '../../services/products.service';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

const templateLineSchema = z.object({
  productId: z.coerce.number().int().min(1, 'Product is required'),
  variantId: z.coerce.number().int().optional().nullable(),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').default(1),
});

const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  planId: z.coerce.number().int().min(1, 'Plan is required'),
  validityDays: z.coerce.number().int().min(1, 'Validity in days must be at least 1').default(30),
  lines: z.array(templateLineSchema).min(1, 'At least one line item is required'),
});

type TemplateFormData = z.infer<typeof templateSchema>;

export interface QuotationTemplateFormProps {
  initialData?: QuotationTemplate | null;
  onSubmit: (data: TemplateFormData) => Promise<void>;
  isLoading?: boolean;
}

export const QuotationTemplateForm: React.FC<QuotationTemplateFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const [plansRes, productsRes] = await Promise.all([
          listPlans({ active: true }),
          listProducts({ limit: 100 }),
        ]);
        setPlans(plansRes || []);
        setProducts(productsRes.items || []);
      } catch {
        // absorb
      }
    }
    loadCatalog();
  }, []);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: initialData?.name || '',
      planId: initialData?.planId || (plans[0]?.id ? Number(plans[0].id) : 1),
      validityDays: initialData?.validityDays || 30,
      lines: initialData?.lines?.map((l) => ({
        productId: l.productId,
        variantId: l.variantId || null,
        quantity: l.quantity,
      })) || [{ productId: 0, variantId: null, quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines',
  });

  const watchLines = watch('lines') || [];

  // Compute live price preview per line & total
  const lineCalculations = watchLines.map((line) => {
    const prod = products.find((p) => Number(p.id) === Number(line.productId));
    if (!prod) return { unitPrice: 0, amount: 0, prod: null, variants: [] };

    const variants = prod.variants || [];
    const chosenVariant = variants.find((v) => Number(v.id) === Number(line.variantId));
    const extra = chosenVariant ? Number(chosenVariant.extraPrice || 0) : 0;
    const unitPrice = Number(prod.salesPrice || 0) + extra;
    const amount = unitPrice * Number(line.quantity || 1);

    return { unitPrice, amount, prod, variants };
  });

  const totalEstimate = lineCalculations.reduce((sum, l) => sum + l.amount, 0);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Template Name"
            placeholder="e.g. Enterprise Annual Tier"
            error={errors.name?.message}
            {...register('name')}
          />
        </div>

        <Input
          label="Validity (Days)"
          type="number"
          min="1"
          error={errors.validityDays?.message}
          {...register('validityDays')}
        />

        <div className="md:col-span-3">
          <Select
            label="Default Plan"
            error={errors.planId?.message}
            options={plans.map((p) => ({
              value: p.id,
              label: `${p.name} ($${Number(p.price).toFixed(2)} / ${p.period.toLowerCase()}, min qty: ${p.minQuantity})`,
            }))}
            {...register('planId')}
          />
        </div>
      </div>

      {/* Line Items Editor */}
      <div className="border-t border-slate-200 pt-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Template Product Lines</h3>
            <p className="text-xs text-slate-500">Preset line items included when sales reps build a quote from this template</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ productId: products[0]?.id || 0, variantId: null, quantity: 1 })}
          >
            + Add Product Line
          </Button>
        </div>

        {errors.lines?.message && (
          <p className="text-xs text-rose-600 mb-2">{errors.lines.message}</p>
        )}

        <div className="space-y-3">
          {fields.map((field, idx) => {
            const lineInfo = lineCalculations[idx] || { unitPrice: 0, amount: 0, variants: [] };
            const selectedProd = products.find((p) => Number(p.id) === Number(watchLines[idx]?.productId));
            const availableVariants = selectedProd?.variants || [];

            return (
              <div
                key={field.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
              >
                {/* Product Select */}
                <div className="flex-1 w-full sm:w-auto">
                  <select
                    className="w-full rounded-md border border-slate-300 py-2 px-3 text-sm bg-white"
                    {...register(`lines.${idx}.productId` as const)}
                  >
                    <option value="">Select product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${Number(p.salesPrice).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Variant Select filtered by product */}
                <div className="w-full sm:w-44">
                  <select
                    className="w-full rounded-md border border-slate-300 py-2 px-3 text-sm bg-white"
                    disabled={availableVariants.length === 0}
                    {...register(`lines.${idx}.variantId` as const)}
                  >
                    <option value="">No variant</option>
                    {availableVariants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.attribute}: {v.value} (+${Number(v.extraPrice).toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div className="w-full sm:w-24">
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    className="w-full rounded-md border border-slate-300 py-2 px-3 text-sm bg-white"
                    {...register(`lines.${idx}.quantity` as const)}
                  />
                </div>

                {/* Line Price Preview */}
                <div className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded whitespace-nowrap">
                  ${lineInfo.unitPrice.toFixed(2)} &times; {watchLines[idx]?.quantity || 1} = ${lineInfo.amount.toFixed(2)}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(idx)}
                  className="text-rose-500 hover:text-rose-700 self-center"
                >
                  &times;
                </Button>
              </div>
            );
          })}
        </div>

        {/* Total Summary Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-200 mt-4 text-sm font-semibold text-slate-800">
          Estimated Template Total: <span className="text-indigo-600 ml-2">${totalEstimate.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {initialData ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </form>
  );
};
