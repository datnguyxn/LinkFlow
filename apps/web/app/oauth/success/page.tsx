'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import FullScreenLoader from '@/components/common/FullScreenLoader';
import { authService } from '@/services/auth.service';

export default function OAuthSuccessPage() {
  const router = useRouter();


  useEffect(() => {
    authService
      .exchangeGoogleLogin()
      .then(() => router.replace('/dashboard'))
      .catch(() => router.replace('/login'));
  }, []);

  return <FullScreenLoader />;
}
