// OWNER: FE-2
// PURPOSE: Interactive line items editor with tax selection, unit price calculation, and subtotal/tax/total footers

'use client';

import React from 'react';
import { Product, Tax } from '../../types';
import { Button } from '../ui/Button';

export interface EditableLineItem {
  productId: number;
  variantId?: number | null;
  quantity: number;
  taxId?: number | null;
}

export interface LineItemsEditorProps {
  lines: EditableLineItem[];
  onChange: (lines: EditableLineItem[]) => void;
  products: Product[];
  taxes: Tax[];
  minQuantity?: number;
  readOnly?: boolean;
}

export const LineItemsEditor: React.FC<LineItemsEditorProps> = ({
  lines,
  onChange,
  products,
  taxes,
  minQuantity = 1,
  readOnly = false,
}) => {
  const handleAddLine = () => {
    onChange([
      ...lines,
      {
        productId: products[0]?.id || 0,
        variantId: null,
        quantity: Math.max(1, minQuantity),
        taxId: null,
      },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    const updated = [...lines];
    updated.splice(idx, 1);
    onChange(updated);
  };

  const handleUpdateField = (idx: number, field: keyof EditableLineItem, value: any) => {
    const updated = [...lines];
    updated[idx] = { ...updated[idx], [field]: value };
    // Reset variant if product changes
    if (field === 'productId') {
      updated[idx].variantId = null;
    }
    onChange(updated);
  };

  // Calculations
  let subtotal = 0;
  let taxTotal = 0;

  const computedLines = lines.map((line) => {
    const product = products.find((p) => Number(p.id) === Number(line.productId));
    const variants = product?.variants || [];
    const variant = variants.find((v) => Number(v.id) === Number(line.variantId));

    const extra = variant ? Number(variant.extraPrice || 0) : 0;
    const unitPrice = product ? Number(product.salesPrice || 0) + extra : 0;
    const base = unitPrice * Number(line.quantity || 1);

    const tax = taxes.find((t) => Number(t.id) === Number(line.taxId));
    let taxAmount = 0;
    if (tax) {
      if (tax.type === 'PERCENT') {
        taxAmount = (base * Number(tax.value)) / 100;
      } else {
        taxAmount = Number(tax.value);
      }
    }

    subtotal += base;
    taxTotal += taxAmount;

    return {
      product,
      variants,
      unitPrice,
      base,
      taxAmount,
      total: base + taxAmount,
    };
  });

  const grandTotal = subtotal + taxTotal;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Subscription Line Items</h3>
        {!readOnly && (
          <Button type="button" variant="outline" size="sm" onClick={handleAddLine}>
            + Add Product Line
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Variant</th>
              <th className="px-4 py-3 w-24">Qty</th>
              <th className="px-4 py-3">Unit Price</th>
              <th className="px-4 py-3">Tax</th>
              <th className="px-4 py-3 text-right">Amount</th>
              {!readOnly && <th className="px-4 py-3 w-10"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {lines.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400 italic">
                  No products added yet. Click &ldquo;+ Add Product Line&rdquo; to begin.
                </td>
              </tr>
            ) : (
              lines.map((line, idx) => {
                const computed = computedLines[idx];
                const isBelowMin = Number(line.quantity) < minQuantity;

                return (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    {/* Product */}
                    <td className="px-4 py-2.5">
                      {readOnly ? (
                        <span className="font-medium text-slate-900">{computed?.product?.name || '—'}</span>
                      ) : (
                        <select
                          value={line.productId}
                          onChange={(e) => handleUpdateField(idx, 'productId', Number(e.target.value))}
                          className="w-full rounded border border-slate-300 py-1.5 px-2 text-sm bg-white"
                        >
                          <option value="">Select product...</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    {/* Variant */}
                    <td className="px-4 py-2.5">
                      {readOnly ? (
                        <span className="text-xs text-slate-600">
                          {computed?.variants.find((v) => Number(v.id) === Number(line.variantId))?.value || '—'}
                        </span>
                      ) : (
                        <select
                          value={line.variantId || ''}
                          disabled={!computed?.variants || computed.variants.length === 0}
                          onChange={(e) =>
                            handleUpdateField(
                              idx,
                              'variantId',
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                          className="w-full rounded border border-slate-300 py-1.5 px-2 text-sm bg-white disabled:bg-slate-100"
                        >
                          <option value="">Standard (No variant)</option>
                          {computed?.variants.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.attribute}: {v.value} (+${Number(v.extraPrice).toFixed(2)})
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    {/* Quantity */}
                    <td className="px-4 py-2.5">
                      {readOnly ? (
                        <span>{line.quantity}</span>
                      ) : (
                        <div>
                          <input
                            type="number"
                            min={minQuantity}
                            value={line.quantity}
                            onChange={(e) => handleUpdateField(idx, 'quantity', Number(e.target.value))}
                            className={`w-full rounded border py-1.5 px-2 text-sm ${
                              isBelowMin ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                            }`}
                          />
                          {isBelowMin && (
                            <p className="text-[10px] text-rose-600 mt-0.5">Min: {minQuantity}</p>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Unit Price (Read-only) */}
                    <td className="px-4 py-2.5 whitespace-nowrap text-slate-600">
                      ${computed?.unitPrice.toFixed(2)}
                    </td>

                    {/* Tax */}
                    <td className="px-4 py-2.5">
                      {readOnly ? (
                        <span className="text-xs text-slate-600">
                          {taxes.find((t) => Number(t.id) === Number(line.taxId))?.name || 'No Tax'}
                        </span>
                      ) : (
                        <select
                          value={line.taxId || ''}
                          onChange={(e) =>
                            handleUpdateField(
                              idx,
                              'taxId',
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                          className="w-full rounded border border-slate-300 py-1.5 px-2 text-sm bg-white"
                        >
                          <option value="">No Tax</option>
                          {taxes.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} ({t.type === 'PERCENT' ? `${t.value}%` : `$${t.value}`})
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    {/* Line Amount */}
                    <td className="px-4 py-2.5 text-right font-medium text-slate-900 whitespace-nowrap">
                      ${computed?.base.toFixed(2)}
                    </td>

                    {!readOnly && (
                      <td className="px-4 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="text-slate-400 hover:text-rose-600 font-bold"
                        >
                          &times;
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Totals */}
      <div className="flex flex-col items-end gap-1.5 pt-3 pr-2 text-sm text-slate-700">
        <div className="flex justify-between w-60">
          <span className="text-slate-500">Subtotal:</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between w-60">
          <span className="text-slate-500">Estimated Tax:</span>
          <span className="font-medium">${taxTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between w-60 border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
          <span>Total:</span>
          <span className="text-indigo-600">${grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
