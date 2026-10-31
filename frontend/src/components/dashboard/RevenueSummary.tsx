// OWNER: FE-2
// PURPOSE: Interactive Recharts visualizations: Revenue breakdown and payment methods distribution

'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { DashboardSummary } from '../../types';
import { formatMoney } from '../../lib/format';

export interface RevenueSummaryProps {
  summary: DashboardSummary;
}

export const RevenueSummary: React.FC<RevenueSummaryProps> = ({ summary }) => {
  const financialData = [
    {
      name: 'Collected',
      amount: summary.revenueReceived,
      fill: '#10B981', // Emerald
    },
    {
      name: 'Outstanding',
      amount: summary.amountOutstanding,
      fill: '#3B82F6', // Blue
    },
    {
      name: 'Overdue',
      amount: summary.overdueAmount,
      fill: '#EF4444', // Red
    },
  ];

  const methodColors: Record<string, string> = {
    CARD: '#6366F1',
    BANK_TRANSFER: '#0EA5E9',
    UPI: '#8B5CF6',
    CASH: '#10B981',
    CHEQUE: '#F59E0B',
  };

  const paymentMethodData = (summary.paymentsByMethod || []).map((p) => ({
    name: p.method,
    value: p.amount,
    count: p.count,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Financial Overview Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Collections vs Exposure</h3>
          <p className="text-xs text-slate-500">Collected revenue compared to open & overdue balances</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financialData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip
                formatter={(value: any) => [formatMoney(Number(value)), 'Amount']}
                contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Methods Distribution Pie Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Payment Channels</h3>
          <p className="text-xs text-slate-500">Breakdown of settled revenue by transaction channel</p>
        </div>

        <div className="h-64 w-full">
          {paymentMethodData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={methodColors[entry.name] || '#94A3B8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [formatMoney(Number(value)), 'Revenue']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}
                />
                <Legend
                  formatter={(val) => <span className="text-xs text-slate-700">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No payment transactions in selected period.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
