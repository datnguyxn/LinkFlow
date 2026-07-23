'use client';

import { createContext, useContext } from 'react';
import type { UserProfile } from '@/types/auth';

export interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  authenticated: boolean;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  authenticated: false,
});

export function useAuthContext() {
  return useContext(AuthContext);
}
