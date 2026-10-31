// OWNER: FE-1
// Root layout: global CSS, AuthProvider
import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Subscription Management System - Brightloop',
  description: 'Odoo-style subscription management platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
