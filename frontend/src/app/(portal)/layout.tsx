// OWNER: FE-2
// PURPOSE: Customer self-service portal layout with customer Topbar and role guard

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { RoleGuard } from '../../components/layout/RoleGuard';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navLinks = [
    { href: '/my-subscriptions', label: 'My Subscriptions' },
    { href: '/my-invoices', label: 'My Invoices' },
  ];

  return (
    <RoleGuard roles={['CUSTOMER']}>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Customer Topbar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/my-subscriptions" className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-900 tracking-tight">Brightloop</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  Customer Portal
                </span>
              </Link>

              <nav className="hidden sm:flex items-center gap-2">
                {navLinks.map((link) => {
                  const isActive = pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <span className="block text-xs font-semibold text-slate-800">{user?.name}</span>
                <span className="block text-[11px] text-slate-400">{user?.email}</span>
              </div>
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation bar */}
        <div className="sm:hidden flex border-b border-slate-200 bg-white px-4 py-2 gap-2">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-1 text-center py-1.5 rounded-lg text-xs font-medium ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Content Area */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}
