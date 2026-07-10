'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { authService } from '@/services/auth.service';
import FullScreenLoader from '@/components/common/FullScreenLoader';

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthContextValue {
  initialized: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  initialized: false,
});

export default function AuthProvider({ children }: AuthProviderProps) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        await authService.initialize();
      } finally {
        if (mounted) {
          setInitialized(true);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Có thể thay bằng Skeleton hoặc SplashScreen
   */
  if (!initialized) {
    return <FullScreenLoader />;
  }

  return <AuthContext.Provider value={{ initialized }}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
