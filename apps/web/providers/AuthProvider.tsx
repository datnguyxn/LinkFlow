'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import FullScreenLoader from '@/components/common/FullScreenLoader';
import { authEvents } from '@/events/auth.event';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { AUTH_EVENT, createAuthChannel } from '@/lib/auth-broadcast';

interface Props {
  children: ReactNode;
}

const AuthContext = createContext({});

const guestRoutes = ['/', '/login', '/register', '/register/success', '/verify-email'];

function isGuestRoute(pathname: string) {
  return guestRoutes.some((route) => {
    if (route === '/') {
      return pathname === '/';
    }

    return pathname.startsWith(route);
  });
}

export default function AuthProvider({ children }: Props) {

  const router = useRouter();

  const pathname = usePathname();

  const loading = useAuthStore((state) => state.loading);

  useEffect(() => {
    const unsubscribe = authEvents.on('logout', () => {
      router.replace('/login');
    });

    return unsubscribe;
  }, [router]);

  useEffect(() => {
    if (isGuestRoute(pathname)) {
      return;
    }

    authService.initialize();
  }, [pathname]);

  //   const listener = async (event: MessageEvent) => {
  //     if (event.origin !== window.location.origin) {
  //       return;
  //     }

  //     if (event.data.type !== 'GOOGLE_LOGIN_SUCCESS') {
  //       return;
  //     }

  //     console.log('event.origin =', event.origin);
  //     console.log('window.location.origin =', window.location.origin);

  //     await authService.initialize();

  //     router.replace('/dashboard');
  //   };

  //   window.addEventListener('message', listener);

  //   return () => window.removeEventListener('message', listener);
  // }, [router]);

  useEffect(() => {
    const channel = createAuthChannel();

    if (!channel) {
      return;
    }

    channel.onmessage = async (event) => {
      switch (event.data?.type) {
        case AUTH_EVENT.GOOGLE_LOGIN_SUCCESS:
          try {
            console.log('Received GOOGLE_LOGIN_SUCCESS event from BroadcastChannel');
            await authService.exchangeGoogleLogin();
            router.replace('/dashboard');
          } catch {
            router.replace('/login');
          }
          break;

        case AUTH_EVENT.LOGOUT:
          router.replace('/login');
          break;
      }
    };
    return () => {
      channel.close();
    };
  }, [router]);

  // if (!isGuestRoute(pathname) && loading) {
  //   return <FullScreenLoader />;
  // }

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
