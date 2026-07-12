import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

import ResendVerificationButton from "./ResendVerificationButton";

interface RegisterSuccessPageProps {
  searchParams?: Promise<{
    email?: string;
  }>;
}

export default async function RegisterSuccessPage({
  searchParams,
}: RegisterSuccessPageProps) {
  const params = await searchParams;

  const email = params?.email;

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
              bg-blue-100
              dark:bg-blue-900/30
            "
          >
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="mt-6 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Check your email
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
            Your account has been created successfully.
          </p>

          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">
            We have sent a verification email
            {email && (
              <>
                {" "}
                to{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {email}
                </span>
              </>
            )}
            .
          </p>

          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">
            Please open your inbox and click the verification link to activate
            your account.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <ResendVerificationButton email={email} />

          <Link
            href="/login"
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-300
              px-4
              py-3
              text-sm
              font-semibold
              text-slate-700
              transition
              hover:bg-slate-50
              dark:border-slate-700
              dark:text-slate-300
              dark:hover:bg-slate-800
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>

        <div className="mt-8 rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
          <p className="text-center text-xs leading-6 text-slate-500 dark:text-slate-400">
            Did not you receive the email? Check your spam folder or click{" "}
            <span className="font-semibold">
              Resend Verification Email
            </span>
            .
          </p>
        </div>
      </div>
    </main>
  );
}