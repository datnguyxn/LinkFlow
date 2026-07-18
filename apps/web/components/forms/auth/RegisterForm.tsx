'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/button';

import { loginWithGoogle } from '@/lib/apis/auth.api';
import { registerSchema, type RegisterForm } from '@/lib/validators/auth.validator';
import { appToast } from '@/lib/toast';

import { useRegister } from '@/hooks/mutations/useRegister';

export default function RegisterForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerMutation.mutateAsync({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      });

      appToast.success('Registration successful');

      router.replace(`/register/success?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <button
        type="button"
        onClick={loginWithGoogle}
        className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border bg-white font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
      >
        <FcGoogle size={24} />
        Continue with Google
      </button>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-700" />
        <span className="text-slate-400">or register with email</span>
        <div className="h-px flex-1 bg-slate-700" />
      </div>

      <div className="space-y-5">
        <div>
          <label
            htmlFor="fullname"
            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Full Name <span className="text-red-500">*</span>
          </label>

          <Input
            id="fullname"
            placeholder="Your full name"
            icon={<User className="text-slate-500" />}
            error={errors.fullName?.message}
            {...register('fullName')}
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Email <span className="text-red-500">*</span>
          </label>

          <Input
            id="email"
            placeholder="your@email.com"
            icon={<Mail className="text-slate-500" />}
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Password <span className="text-red-500">*</span>
          </label>

          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Your secure password"
            icon={<Lock className="text-slate-500" />}
            error={errors.password?.message}
            {...register('password')}
            right={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
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
            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Confirm Password <span className="text-red-500">*</span>
          </label>

          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            icon={<Lock className="text-slate-500" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
            right={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
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
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" />I agree to the Terms of Service and Privacy Policy.
      </label>

      <Button loading={registerMutation.isPending}>Create Account</Button>
    </motion.form>
  );
}
