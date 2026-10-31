// OWNER: FE-1
// PURPOSE: Tax rules catalog list page (ADMIN and STAFF)

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { listTaxes } from '../../../services/taxes.service';
import { Tax } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Spinner } from '../../../components/ui/Spinner';
import { useAuth } from '../../../hooks/useAuth';

export default function TaxesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await listTaxes();
        setTaxes(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tax Rules</h1>
          <p className="text-sm text-slate-500">
            Configure percentage or fixed taxes applied automatically to invoice lines
          </p>
        </div>

        {isAdmin && (
          <Link href="/taxes/new">
            <Button variant="primary">+ New Tax Rule</Button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      ) : taxes.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
          No tax rules configured.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {taxes.map((tax) => (
            <div
              key={tax.id}
              onClick={() => router.push(`/taxes/${tax.id}`)}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900">{tax.name}</h3>
                  <Badge status={tax.type} label={tax.type} size="sm" />
                </div>
                <div className="text-2xl font-extrabold text-indigo-600">
                  {tax.type === 'PERCENT' ? `${tax.value}%` : `$${Number(tax.value).toFixed(2)}`}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                  {isAdmin ? 'Edit →' : 'View →'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
