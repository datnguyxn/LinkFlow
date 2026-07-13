'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/button';
import { loginWithGoogle } from '@/lib/apis/auth.api';
import { type RegisterForm, registerSchema } from '@/lib/validators/auth.validator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/dist/client/components/navigation';
import { appToast } from '@/lib/toast';
import { authService } from '@/services/auth.service';

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const router = useRouter();

  const onSubmit = async (data: RegisterForm) => {
    try {
      if (data.password !== data.confirmPassword) {
        // Handle password mismatch error
        appToast.error('Passwords do not match. Please try again.');
        return;
      }

      // Call your registration API here

      const result = await authService.register(data.email, data.password, data.fullName);

      console.log('Registration successful:', result);

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
      className="space-y-6"
      onSubmit={handleSubmit(onSubmit)}
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
        <span className="text-slate-400">or register with email</span>
        <div className="h-px flex-1 bg-slate-700" />
      </div>

      <div className="space-y-5">
        <div>
          <label
            htmlFor="fullname"
            className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-slate-700
                    dark:text-slate-200
                  "
          >
            Full Name
            <span className="ml-1 text-red-500">*</span>
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
            type={showConfirm ? 'text' : 'password'}
            placeholder="Your secure password"
            icon={<Lock className="text-slate-500" />}
            error={errors.password?.message}
            {...register('password')}
            right={
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="cursor-pointer"
              >
                {showConfirm ? (
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
            className="
              mb-2
              block
              text-sm
              font-medium
              text-slate-700
              dark:text-slate-200
            "
          >
            Confirm Password
            <span className="ml-1 text-red-500">*</span>
          </label>

          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            icon={<Lock className="text-slate-500" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
            right={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
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
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" />I agree to the Terms of Service and Privacy Policy.
      </label>

      <Button loading={isSubmitting}>Create Account</Button>
    </motion.form>
  );
}
