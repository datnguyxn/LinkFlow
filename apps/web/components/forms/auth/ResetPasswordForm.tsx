'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { authService } from '@/services/auth.service';
import { appToast } from '@/lib/toast';
import { resetPasswordSchema, type ResetPasswordForm } from '@/lib/validators/auth.validator';
import Input from '@/components/ui/Input';

export default function ResetPasswordForm() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const token = searchParams.get('token');

  const [validating, setValidating] = useState(true);

  const [validToken, setValidToken] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setValidating(false);
        return;
      }

      try {
        await authService.resetPasswordValidate(token);

        setValidToken(true);
      } catch {
        setValidToken(false);
      } finally {
        setValidating(false);
      }
    }

    validateToken();
  }, [token]);

  async function onSubmit(values: ResetPasswordForm) {
    if (!token) {
      return;
    }

    try {
      await authService.resetPassword(token, values.password);

      appToast.success('Password reset successfully.');

      router.replace('/reset-password/success');
    } catch {
      appToast.error('Failed to reset password.');
    }
  }

  if (validating) {
    return;
  }

  if (!validToken) {
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
        <div className="text-center">
          <div
            className="
            mx-auto
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            bg-red-100
            dark:bg-red-900/20
          "
          >
            <Lock className="h-8 w-8 text-red-500" />
          </div>

          <h1 className="mt-6 text-3xl font-bold text-slate-900 dark:text-white">Invalid Link</h1>

          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
            This password reset link is invalid, expired, or has already been used.
          </p>

          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">
            Please request a new password reset email and try again.
          </p>

          <Link
            href="/forgot-password"
            className="
            mt-8
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-blue-600
            px-5
            py-3
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-blue-700
          "
          >
            <ArrowLeft className="h-4 w-4" />
            Request New Link
          </Link>

          <div className="mt-4">
            <Link
              href="/login"
              className="
              text-sm
              font-medium
              text-slate-600
              hover:text-slate-900
              dark:text-slate-400
              dark:hover:text-white
            "
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
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
          <Lock className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      <div className="mt-6 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Reset Password</h1>

        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
          Enter your new password below.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            New Password
          </label>

          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your new password"
            icon={<Lock className="text-slate-500" />}
            error={errors.password?.message}
            {...register('password')}
            right={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="text-slate-500" />
                ) : (
                  <Eye className="text-slate-500" />
                )}
              </button>
            }
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Confirm Password
          </label>

          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your new password"
            icon={<Lock className="text-slate-500" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
            right={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="cursor-pointer"
              >
                {showConfirmPassword ? (
                  <EyeOff className="text-slate-500" />
                ) : (
                  <Eye className="text-slate-500" />
                )}
              </button>
            }
          />
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
          {isSubmitting ? 'Resetting...' : 'Reset Password'}
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
