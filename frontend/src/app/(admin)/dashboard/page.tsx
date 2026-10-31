// OWNER: FE-2
// PURPOSE: Executive finance & subscription management dashboard

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  getDashboardSummary,
  getSubscriptionsByStatus,
} from '../../../services/dashboard.service';
import { DashboardSummary } from '../../../types';
import { StatCard } from '../../../components/dashboard/StatCard';
import { DashboardFilters } from '../../../components/dashboard/DashboardFilters';
import { RevenueSummary } from '../../../components/dashboard/RevenueSummary';
import { OverdueTable } from '../../../components/dashboard/OverdueTable';
import { formatMoney } from '../../../lib/format';
import { Spinner } from '../../../components/ui/Spinner';

export default function DashboardPage() {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, statusRes] = await Promise.all([
        getDashboardSummary(filters),
        getSubscriptionsByStatus(),
      ]);
      setSummary(sumRes);
      setStatusCounts(statusRes);
    } catch (_) {
      // Handled gracefully
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Finance & Operations Dashboard</h1>
        <p className="text-sm text-slate-500">
          Real-time billing performance, cash collections, and subscription health
        </p>
      </div>

      {/* Global Dashboard Filters */}
      <DashboardFilters onChange={setFilters} />

      {/* KPI Stat Cards */}
      {summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Active Subscriptions"
            value={summary.activeSubscriptions}
            subtitle={`${statusCounts.ACTIVE || summary.activeSubscriptions} subscriptions actively generating revenue`}
            badge={{ text: 'Live', variant: 'success' }}
          />

          <StatCard
            title="Revenue Collected"
            value={formatMoney(summary.revenueReceived)}
            subtitle="Total cleared cash settlements in period"
            badge={{ text: 'Cleared', variant: 'success' }}
          />

          <StatCard
            title="Amount Outstanding"
            value={formatMoney(summary.amountOutstanding)}
            subtitle="Confirmed uncollected receivables"
            badge={{ text: 'Pending', variant: 'info' }}
          />

          <StatCard
            title="Overdue Receivables"
            value={formatMoney(summary.overdueAmount)}
            subtitle={`${summary.overdueCount} invoices past due date`}
            badge={{
              text: summary.overdueCount > 0 ? `${summary.overdueCount} Past Due` : 'Healthy',
              variant: summary.overdueCount > 0 ? 'danger' : 'success',
            }}
          />
        </div>
      ) : (
        <div className="flex justify-center p-8">
          <Spinner size="lg" />
        </div>
      )}

      {/* Subscriptions by Status Mini Row */}
      {statusCounts && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Subscription Pipeline by Status
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium">Draft</span>
              <p className="text-xl font-bold text-slate-800 mt-1">{statusCounts.DRAFT || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
              <span className="text-[11px] text-purple-700 font-medium">Quotations</span>
              <p className="text-xl font-bold text-purple-900 mt-1">{statusCounts.QUOTATION || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
              <span className="text-[11px] text-blue-700 font-medium">Confirmed</span>
              <p className="text-xl font-bold text-blue-900 mt-1">{statusCounts.CONFIRMED || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[11px] text-emerald-700 font-medium">Active</span>
              <p className="text-xl font-bold text-emerald-900 mt-1">{statusCounts.ACTIVE || 0}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-300">
              <span className="text-[11px] text-slate-600 font-medium">Closed</span>
              <p className="text-xl font-bold text-slate-700 mt-1">{statusCounts.CLOSED || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Visual Analytics */}
      {summary && <RevenueSummary summary={summary} />}

      {/* Overdue Follow-up Table */}
      <OverdueTable filters={{ customerId: filters.customerId }} />
    </div>
  );
}
