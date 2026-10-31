// OWNER: FE-1
// PURPOSE: Root entrypoint: redirects to role-appropriate home or /login

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from '../components/ui/Spinner';

export default function RootPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role === 'CUSTOMER') {
        router.replace('/my-subscriptions');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <span className="text-sm text-slate-500 font-medium">Loading Brightloop...</span>
      </div>
    </div>
  );
}
