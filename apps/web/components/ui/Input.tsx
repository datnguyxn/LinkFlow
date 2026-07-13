'use client';

import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
  right?: React.ReactNode;
}

export default function Input({ icon, error, right, className, ...props }: Props) {
  return (
    <div>
      <div
        className={cn(
          `
          flex
          h-12
          items-center
          rounded-2xl
          border
          dark:border-slate-700
          dark:bg-slate-900
          px-4
          transition
          focus-within:border-blue-500
          dark:focus-within:border-blue-500
        `,
          error && 'border-red-500',
        )}
      >
        {icon}

        <input
          className={cn(
            `
            flex-1
            bg-transparent
            px-3
            text-black
            dark:text-white
            outline-none
            placeholder:text-slate-500
          `,
            className,
          )}
          {...props}
        />

        {right}
      </div>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
