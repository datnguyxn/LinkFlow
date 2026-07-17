'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { authEvents } from '@/events/auth.event';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { AUTH_EVENT, createAuthChannel } from '@/lib/auth-broadcast';
import { appToast } from '@/lib/toast';
import { ROUTES, isProtectedRoute } from '@/constants/routes';
import { useAppTheme } from '@/services/theme.service';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  children: ReactNode;
}

const AuthContext = createContext({});

export default function AuthProvider({ children }: Props) {
  const router = useRouter();

  const pathname = usePathname();

  const loading = useAuthStore((state) => state.loading);

  const { applyTheme } = useAppTheme();

  /**
   * Handle logout event
   */
  useEffect(() => {
    return authEvents.on('logout', () => {
      router.replace(ROUTES.LOGIN);
    });
  }, [router]);

  /**
   * Initialize authenticated user
   */
  useEffect(() => {
    if (!isProtectedRoute(pathname)) {
      return;
    }

    authService.initialize();
  }, [pathname]);

  /**
   * Listen OAuth events
   */
  useEffect(() => {
    const channel = createAuthChannel();

    if (!channel) {
      return;
    }

    channel.onmessage = async ({ data }) => {
      switch (data?.type) {
        case AUTH_EVENT.GOOGLE_LOGIN_SUCCESS:
          try {
            await authService.exchangeGoogleLogin();

            router.replace(ROUTES.DASHBOARD);
          } catch {
            appToast.error('Failed to sign in with Google.');

            router.replace(ROUTES.LOGIN);
          }

          break;

        case AUTH_EVENT.GOOGLE_LOGIN_CANCELLED:
          appToast.error('Google sign in was cancelled.');

          router.replace(ROUTES.LOGIN);

          break;

        case AUTH_EVENT.LOGOUT:
          router.replace(ROUTES.LOGIN);

          break;
      }
    };

    return () => {
      channel.close();
    };
  }, [router]);

  //Nếu muốn hiện loading toàn màn hình thì mở lại.

  // if (!isPublicRoute(pathname) && loading) {
  //   return <Skeleton />;
  // }

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
