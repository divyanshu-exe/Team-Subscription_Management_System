// OWNER: FE-1
// PURPOSE: Root HTML layout with AuthProvider and ToastProvider

import './globals.css';
import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../components/ui/Toast';

export const metadata = {
  title: 'Brightloop - Subscription & Recurring Billing Management',
  description: 'Enterprise subscription lifecycle and automated recurring billing system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 font-sans antialiased min-h-screen">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
