'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/button';
import { Eye, LockKeyhole, EyeOff, Lock } from 'lucide-react';
import { useState } from 'react';
import { ChangePasswordForm, changePasswordSchema } from '@/lib/validators/user.validator';
import { zodResolver } from '@hookform/resolvers/zod/dist/zod.js';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useUser } from '@/hooks/useUser';
import { appToast } from '@/lib/toast';
import { useAuth } from '@/hooks/useAuth';
import ChangePasswordCardSkeleton from './ChangePasswordCardSkeleton';

export default function ChangePasswordCard() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { changePassword } = useUser();

  const { user, loading, logout } = useAuth();

  const isGoogleAccount = user?.provider === 'GOOGLE';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    try {
      const response = await changePassword(data.oldPassword, data.newPassword);

      // Handle success (e.g., show a success message)
      console.log('Password changed successfully');

      appToast.success(response.data.message || 'Password changed successfully');

      await logout(); // Log the user out after changing the password
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };

  if (loading || !user) {
    return <ChangePasswordCardSkeleton />;
  }

  return (
    <Card className=" mx-8 shadow-lg dark:bg-slate-900">
      <CardHeader>
        <div className="flex items-center gap-3">
          <LockKeyhole className="h-5 w-5 text-blue-600" />

          <div>
            <CardTitle>Password</CardTitle>

            <CardDescription>Update your password.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isGoogleAccount ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-start gap-3">
                <LockKeyhole className="mt-0.5 h-5 w-5 text-slate-500" />

                <div>
                  <h3 className="font-medium">Password managed by Google</h3>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    You signed in using your Google account. Your password is managed by Google, so
                    it can not be changed from LinkFlow.
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  'https://myaccount.google.com/security',
                  '_blank',
                  'noopener,noreferrer',
                )
              }
            >
              Manage Google Account
            </Button>
          </div>
        ) : (
          <motion.form
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="current-password"
                className="
              mb-2
              block
              text-sm
              font-medium
              text-slate-700
              dark:text-slate-200
            "
              >
                Current Password
                <span className="ml-1 text-red-500">*</span>
              </label>

              <Input
                id="current-password"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Your secure password"
                icon={<Lock className="text-slate-500" />}
                error={errors.oldPassword?.message}
                {...register('oldPassword')}
                right={
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="cursor-pointer"
                  >
                    {showCurrentPassword ? (
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
                htmlFor="new-password"
                className="
              mb-2
              block
              text-sm
              font-medium
              text-slate-700
              dark:text-slate-200
            "
              >
                New Password
                <span className="ml-1 text-red-500">*</span>
              </label>

              <Input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Your secure password"
                icon={<Lock className="text-slate-500" />}
                error={errors.newPassword?.message}
                {...register('newPassword')}
                right={
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="cursor-pointer"
                  >
                    {showNewPassword ? (
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
                htmlFor="confirm-password"
                className="
              mb-2
              block
              text-sm
              font-medium
              text-slate-700
              dark:text-slate-200
            "
              >
                Confirm New Password
                <span className="ml-1 text-red-500">*</span>
              </label>

              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Your secure password"
                icon={<Lock className="text-slate-500" />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
                right={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

            <Button loading={isSubmitting} variant="outline">
              Update Password
            </Button>
          </motion.form>
        )}
      </CardContent>
    </Card>
  );
}
