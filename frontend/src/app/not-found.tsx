// OWNER: FE-1
// PURPOSE: Global 404 Not Found error page

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto text-2xl font-bold">
          404
        </div>
        <h1 className="text-xl font-bold text-slate-900">Page Not Found</h1>
        <p className="text-xs text-slate-500">
          The page or record you are looking for does not exist, has been removed, or you do not have permission to view it.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center font-medium rounded-lg transition-colors bg-indigo-600 text-white hover:bg-indigo-700 w-full py-2 text-sm"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
