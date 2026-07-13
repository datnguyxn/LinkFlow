import { Suspense } from 'react';

import FullScreenLoader from '@/components/common/FullScreenLoader';
import ResetPasswordForm from '@/components/forms/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <main
      className="
        flex
        h-screen
        items-center
        justify-center
        bg-gradient-to-br
        from-slate-50
        via-white
        to-slate-100
        px-6
        py-10
        dark:from-slate-950
        dark:via-slate-900
        dark:to-slate-950
      "
    >
      <div className="w-full max-w-md">
        <Suspense fallback={<FullScreenLoader />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
