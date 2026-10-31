// OWNER: FE-1
// PURPOSE: Global error boundary page for runtime client/server errors

'use client';

import React, { useEffect } from 'react';
import { Button } from '../components/ui/Button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-red-100 p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto text-2xl font-bold">
          !
        </div>
        <h1 className="text-xl font-bold text-slate-900">Something went wrong</h1>
        <p className="text-xs text-slate-500">
          {error.message || 'An unexpected error occurred while processing your request.'}
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Home
          </Button>
          <Button variant="primary" onClick={() => reset()}>
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
