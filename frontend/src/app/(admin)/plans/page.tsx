// OWNER: FE-1
// PURPOSE: Subscription plans catalog list page

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { listPlans } from '../../../services/plans.service';
import { Plan } from '../../../types';
import { formatMoney, formatDate } from '../../../lib/format';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Spinner } from '../../../components/ui/Spinner';
import { useAuth } from '../../../hooks/useAuth';

export default function PlansPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await listPlans();
        setPlans(data);
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
          <h1 className="text-2xl font-bold text-slate-900">Subscription Plans</h1>
          <p className="text-sm text-slate-500">
            Define recurring billing periods, pricing, minimum quantities, and lifecycle flags
          </p>
        </div>

        {isAdmin && (
          <Link href="/plans/new">
            <Button variant="primary">+ New Plan</Button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      ) : plans.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
          No subscription plans found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => router.push(`/plans/${plan.id}`)}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  <Badge status={plan.period} label={plan.period} size="sm" />
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {formatMoney(plan.price)}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">/ {plan.period.toLowerCase()}</span>
                </div>

                <div className="text-xs text-slate-500 space-y-1.5 border-t border-slate-100 pt-3">
                  <div>Min Quantity: <span className="font-semibold text-slate-800">{plan.minQuantity}</span></div>
                  <div>Valid: <span className="font-semibold text-slate-800">{formatDate(plan.availableFrom)}</span> to <span className="font-semibold text-slate-800">{formatDate(plan.availableTo)}</span></div>
                </div>

                {/* 4 flags badges */}
                <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-100">
                  {plan.autoCloseAtEnd && (
                    <span className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      Auto-close
                    </span>
                  )}
                  {plan.closableEarly && (
                    <span className="text-[10px] font-medium bg-amber-50 text-amber-800 px-2 py-0.5 rounded">
                      Closable early
                    </span>
                  )}
                  {plan.pausable && (
                    <span className="text-[10px] font-medium bg-blue-50 text-blue-800 px-2 py-0.5 rounded">
                      Pausable
                    </span>
                  )}
                  {plan.renewable && (
                    <span className="text-[10px] font-medium bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">
                      Renewable
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
                <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                  {isAdmin ? 'Edit Plan →' : 'View Details →'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
