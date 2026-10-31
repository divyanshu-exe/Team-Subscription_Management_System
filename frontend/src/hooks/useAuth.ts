// OWNER: FE-1
// PURPOSE: Convenience hook to consume AuthContext

'use client';

import { useAuthContext } from '../context/AuthContext';

export function useAuth() {
  return useAuthContext();
}
