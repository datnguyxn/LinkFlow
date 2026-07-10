'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { loginSchema, type LoginForm } from '@/lib/auth.validator';

import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

import { FcGoogle } from 'react-icons/fc';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { loginWithGoogle } from '@/lib/apis/ auth.api';

export default function LoginForm() {
  const [show, setShow] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: '',
      password: '',
      remember: true,
    },
  });

  const onSubmit = async (data: LoginForm) => {
    console.log(data);

    await new Promise((r) => setTimeout(r, 1500));
  };

  return (
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
      <button
        type="button"
         onClick={loginWithGoogle}
        className="
        flex
        h-14
        w-full
        items-center
        justify-center
        gap-3
        rounded-2xl
        border
        bg-white
        font-semibold
        text-slate-700
        hover:bg-slate-100
        transition
        cursor-pointer
        dark:border-slate-700
        dark:bg-slate-900
        dark:hover:bg-slate-800
        dark:text-white
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
            className="
              mb-2
              block
              text-sm
              font-medium
              text-slate-700
              dark:text-slate-200
            "
          >
            Email
            <span className="ml-1 text-red-500">*</span>
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
            className="
        mb-2
        block
        text-sm
        font-medium
        text-slate-700
        dark:text-slate-200
      "
          >
            Password
            <span className="ml-1 text-red-500">*</span>
          </label>

          <Input
            id="password"
            type={show ? 'text' : 'password'}
            placeholder="Your secure password"
            icon={<Lock className="text-slate-500" />}
            error={errors.password?.message}
            {...register('password')}
            right={
              <button type="button" onClick={() => setShow(!show)} className="cursor-pointer">
                {show ? <EyeOff className="text-slate-500" /> : <Eye className="text-slate-500" />}
              </button>
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-3 text-slate-300">
          <input type="checkbox" {...register('remember')} />
          Remember me
        </label>

        <button type="button" className="text-blue-500 cursor-pointer">
          Forgot password
        </button>
      </div>

      <Button loading={isSubmitting}>Sign In</Button>
    </motion.form>
  );
}
