'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { AuthContext } from '@/contexts/auth.context';
import { useInitializeAuth } from '@/hooks/useInitializeAuth';
import { isProtectedRoute, ROUTES } from '@/constants/routes';
import { authEvents } from '@/events/auth.event';
import { AUTH_EVENT, createAuthChannel } from '@/lib/auth-broadcast';
import { authService } from '@/services/auth.service';
import { appToast } from '@/lib/toast';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const auth = useInitializeAuth({
    enabled: isProtectedRoute(pathname),
  });

  const authenticated = auth.user !== null && !auth.loading;

  useEffect(() => {
    return authEvents.on('logout', () => {
      router.replace(ROUTES.LOGIN);
    });
  }, [router]);

  useEffect(() => {
    const channel = createAuthChannel();

    if (!channel) return;

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
          appToast.error('Google login cancelled.');
          router.replace(ROUTES.LOGIN);
          break;

        case AUTH_EVENT.LOGOUT:
          router.replace(ROUTES.LOGIN);
          break;
      }
    };

    return () => channel.close();
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        authenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
