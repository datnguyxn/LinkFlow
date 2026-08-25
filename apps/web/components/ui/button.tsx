import { ButtonHTMLAttributes } from 'react';
import Spinner from './Spinner';
import { cn } from '@/lib/utils';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm';
  asChild?: boolean;
}

export default function Button({ loading, children, className, variant, size, ...props }: Props) {
  return (
    <button
      disabled={loading}
      className={cn(
        `
        flex
        h-14
        w-full
        items-center
        justify-center
        rounded-2xl
        bg-blue-600
        font-semibold
        text-white
        transition
        hover:bg-blue-700
        disabled:opacity-60
        cursor-pointer
      `,
        variant === 'outline' &&
          'bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-100 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-800',
        variant === 'ghost' &&
          'bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
        variant === 'link' && 'bg-transparent text-blue-600 hover:underline dark:text-blue-400',
        variant === 'destructive' &&
          'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600',
        variant === 'secondary' &&
          'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
        size === 'default' && 'h-14 px-6 py-3 text-base',
        size === 'sm' && 'h-10 px-4 py-2 text-sm',
        size === 'lg' && 'h-16 px-6 py-3 text-lg',
        size === 'icon' && 'h-10 w-10 p-0',
        size === 'icon-sm' && 'h-8 w-8 p-0',
        className,
      )}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}
