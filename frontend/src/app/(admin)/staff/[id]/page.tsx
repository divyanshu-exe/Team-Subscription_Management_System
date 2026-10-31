// OWNER: FE-1
// PURPOSE: Staff details redirect page

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StaffDetailPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/staff');
  }, [router]);

  return null;
}
