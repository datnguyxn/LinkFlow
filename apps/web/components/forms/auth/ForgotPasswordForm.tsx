'use client';

import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { forgotPasswordSchema, type ForgotPasswordForm } from '@/lib/validators/auth.validator';

import { authService } from '@/services/auth.service';
import { appToast } from '@/lib/toast';

export default function ForgotPasswordForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: ForgotPasswordForm) {
    try {
      await authService.forgotPassword(values.email);

      router.push(`/forgot-password/success?email=${encodeURIComponent(values.email)}`);
    } catch {
      appToast.error('Failed to send reset email.');
    }
  }

  return (
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Forgot Password</h1>

        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
          Enter the email address associated with your account and we will send you a password reset
          link.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register('email')}
            className="
              w-full
              rounded-xl
              border
              border-slate-300
              px-4
              py-3
              text-sm
              outline-none
              transition
              focus:border-blue-500
              dark:border-slate-700
              dark:bg-slate-800
              dark:text-white
            "
          />

          {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="
            w-full
            rounded-xl
            bg-blue-600
            px-4
            py-3
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-blue-700
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {isSubmitting ? 'Sending...' : 'Send'}
        </button>

        <Link
          href="/login"
          className="
            flex
            items-center
            justify-center
            gap-2
            text-sm
            font-medium
            text-slate-600
            hover:text-slate-900
            dark:text-slate-400
            dark:hover:text-white
          "
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </form>
    </div>
  );
}
