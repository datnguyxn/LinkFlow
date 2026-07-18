'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/button';

import { appToast } from '@/lib/toast';
import { loginWithGoogle } from '@/lib/apis/auth.api';
import { loginSchema, type LoginForm } from '@/lib/validators/auth.validator';

import { useLogin } from '@/hooks/mutations/useLogin';

export default function LoginForm() {
  const [show, setShow] = useState(false);

  const router = useRouter();

  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login.mutateAsync({
        email: data.email,
        password: data.password,
        remember: data.rememberMe,
      });

      appToast.success('Login successfully');

      router.replace('/dashboard');
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
        className="
          flex h-14 w-full items-center justify-center gap-3 rounded-2xl
          border bg-white font-semibold text-slate-700 transition
          hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900
          dark:text-white dark:hover:bg-slate-800
        "
      >
        <FcGoogle size={24} />
        Continue with Google
      </button>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-700" />
        <span className="text-slate-400">or continue with email</span>
        <div className="h-px flex-1 bg-slate-700" />
      </div>

      <div className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Email <span className="ml-1 text-red-500">*</span>
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
            Password <span className="ml-1 text-red-500">*</span>
          </label>

          <Input
            id="password"
            type={show ? 'text' : 'password'}
            placeholder="Your secure password"
            icon={<Lock className="text-slate-500" />}
            error={errors.password?.message}
            {...register('password')}
            right={
              <button
                type="button"
                onClick={() => setShow((prev) => !prev)}
                className="cursor-pointer"
              >
                {show ? <EyeOff className="text-slate-500" /> : <Eye className="text-slate-500" />}
              </button>
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-3 text-slate-300">
          <input type="checkbox" {...register('rememberMe')} />
          Remember me
        </label>

        <button
          type="button"
          className="cursor-pointer text-blue-500"
          onClick={() => router.push('/forgot-password')}
        >
          Forgot password
        </button>
      </div>

      <Button loading={login.isPending}>Sign In</Button>
    </motion.form>
  );
}
