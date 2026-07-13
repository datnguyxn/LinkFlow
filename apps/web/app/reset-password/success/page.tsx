import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordSuccessPage() {
  return (
    <main
      className="
        flex
        min-h-screen
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
      <div
        className="
          w-full
          max-w-md
          rounded-3xl
          border
          border-slate-200
          bg-white
          p-8
          shadow-xl
          dark:border-slate-800
          dark:bg-slate-900
        "
      >
        <div className="flex justify-center">
          <div
            className="
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              bg-green-100
              dark:bg-green-900/30
            "
          >
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="mt-6 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Password Reset Successful
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
            Your password has been updated successfully.
          </p>

          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">
            For your security, you will need to sign in again using your new password.
          </p>
        </div>

        <div className="mt-8">
          <Link
            href="/login"
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-blue-600
              px-4
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-blue-700
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Go to Login
          </Link>
        </div>

        <div className="mt-8 rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
          <p className="text-center text-xs leading-6 text-slate-500 dark:text-slate-400">
            If you did not make this change, please contact support immediately and secure your
            account.
          </p>
        </div>
      </div>
    </main>
  );
}
