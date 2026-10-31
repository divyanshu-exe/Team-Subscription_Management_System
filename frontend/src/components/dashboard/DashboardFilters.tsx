// OWNER: FE-2
// PURPOSE: Filter controls with date presets (this month, last month, this year), customer and plan selectors

'use client';

import React, { useEffect, useState } from 'react';
import { listCustomers } from '../../services/customers.service';
import { listPlans } from '../../services/plans.service';
import { Customer, Plan } from '../../types';

export interface DashboardFiltersProps {
  onChange: (filters: { from?: string; to?: string; customerId?: string; planId?: string }) => void;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({ onChange }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [planId, setPlanId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    async function loadOptions() {
      try {
        const [cRes, pRes] = await Promise.all([
          listCustomers({ limit: 100 }),
          listPlans({ active: true }),
        ]);
        setCustomers(cRes.items || []);
        setPlans(pRes || []);
      } catch (_) {}
    }
    loadOptions();
  }, []);

  const setPreset = (preset: 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR' | 'ALL_TIME') => {
    const now = new Date();
    if (preset === 'THIS_MONTH') {
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
      setFrom(start.toISOString().split('T')[0]);
      setTo(end.toISOString().split('T')[0]);
    } else if (preset === 'LAST_MONTH') {
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
      const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0));
      setFrom(start.toISOString().split('T')[0]);
      setTo(end.toISOString().split('T')[0]);
    } else if (preset === 'THIS_YEAR') {
      const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
      const end = new Date(Date.UTC(now.getUTCFullYear(), 11, 31));
      setFrom(start.toISOString().split('T')[0]);
      setTo(end.toISOString().split('T')[0]);
    } else {
      setFrom('');
      setTo('');
    }
  };

  useEffect(() => {
    const filters: any = {};
    if (from) filters.from = from;
    if (to) filters.to = to;
    if (customerId) filters.customerId = customerId;
    if (planId) filters.planId = planId;
    onChange(filters);
  }, [from, to, customerId, planId, onChange]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center gap-4 text-xs">
      {/* Presets */}
      <div className="flex items-center gap-1.5 border-r border-slate-200 pr-4">
        <span className="font-semibold text-slate-500 mr-1">Period:</span>
        <button
          type="button"
          onClick={() => setPreset('THIS_MONTH')}
          className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
        >
          This Month
        </button>
        <button
          type="button"
          onClick={() => setPreset('LAST_MONTH')}
          className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
        >
          Last Month
        </button>
        <button
          type="button"
          onClick={() => setPreset('THIS_YEAR')}
          className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
        >
          This Year
        </button>
        <button
          type="button"
          onClick={() => setPreset('ALL_TIME')}
          className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
        >
          All
        </button>
      </div>

      {/* Date Pickers */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="px-2 py-1 border border-slate-300 rounded text-slate-700 bg-white"
        />
        <span className="text-slate-400">&rarr;</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="px-2 py-1 border border-slate-300 rounded text-slate-700 bg-white"
        />
      </div>

      {/* Customer Select */}
      <select
        value={customerId}
        onChange={(e) => setCustomerId(e.target.value)}
        className="px-3 py-1 border border-slate-300 rounded text-slate-700 bg-white"
      >
        <option value="">All Customers</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Plan Select */}
      <select
        value={planId}
        onChange={(e) => setPlanId(e.target.value)}
        className="px-3 py-1 border border-slate-300 rounded text-slate-700 bg-white"
      >
        <option value="">All Plans</option>
        {plans.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {(from || to || customerId || planId) && (
        <button
          type="button"
          onClick={() => {
            setFrom('');
            setTo('');
            setCustomerId('');
            setPlanId('');
          }}
          className="text-indigo-600 hover:underline ml-auto font-medium"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
};
