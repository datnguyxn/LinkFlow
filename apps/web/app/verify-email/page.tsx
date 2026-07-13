import { Suspense } from 'react';

import VerifyEmailClient from '../../components/auth/VerifyEmailClient';
import FullScreenLoader from '@/components/common/FullScreenLoader';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <VerifyEmailClient />
    </Suspense>
  );
}
