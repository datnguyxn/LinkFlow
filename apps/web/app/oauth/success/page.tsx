'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { authApi } from '@/lib/apis/auth.api';
import { tokenStorage } from '@/lib/storage/token.storage';
import { useAuthStore } from '@/stores/auth.store';
import FullScreenLoader from '@/components/common/FullScreenLoader';
import { authService } from '@/services/auth.service';

export default function OAuthSuccessPage() {
  const router = useRouter();

  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    authService
      .exchangeGoogleLogin()
      .then(() => router.replace('/dashboard'))
      .catch(() => router.replace('/login'));
  }, []);

  return <FullScreenLoader />;
}
