// OWNER: FE-1
// PURPOSE: Role-aware navigation sidebar highlighting active routes

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  const isAdmin = user?.role === 'ADMIN';

  // Navigation items definition
  const navItems = [
    { label: 'Dashboard', href: '/dashboard', adminOnly: false },
    { label: 'Customers', href: '/customers', adminOnly: false },
    { label: 'Products', href: '/products', adminOnly: false },
    { label: 'Plans', href: '/plans', adminOnly: false },
    { label: 'Taxes', href: '/taxes', adminOnly: true },
    { label: 'Discounts', href: '/discounts', adminOnly: true },
    { label: 'Quotation Templates', href: '/quotation-templates', adminOnly: false },
    { label: 'Subscriptions', href: '/subscriptions', adminOnly: false },
    { label: 'Invoices', href: '/invoices', adminOnly: false },
    { label: 'Payments', href: '/payments', adminOnly: false },
    { label: 'Billing', href: '/billing', adminOnly: true },
    { label: 'Staff', href: '/staff', adminOnly: true },
  ];

  const visibleItems = navItems.filter((item) => (item.adminOnly ? isAdmin : true));

  return (
    <aside className="w-64 border-r border-slate-200 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 min-h-screen">
      {/* Brand header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
            B
          </div>
          <span className="font-bold text-white text-base tracking-tight">Brightloop SMS</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
              }`}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer system status */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Odoo Subscriptions v1.0</span>
        </div>
      </div>
    </aside>
  );
};
