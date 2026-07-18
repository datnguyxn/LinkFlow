'use client';

import { useMe } from '@/hooks/queries/useMe';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useUpdateProfile } from '@/hooks/mutations/useUpdateProfile';

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const { data: user, isLoading: loading, isError } = useMe();

  const updateProfile = useUpdateProfile();

  const handleThemeChange = async () => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    console.log('CHANGE THEME');
    // đổi UI ngay
    setTheme(nextTheme);

    try {
      // Cập nhật theme trong profile của user
      await updateProfile.mutateAsync({
        theme: nextTheme === 'dark' ? 'DARK' : 'LIGHT',
      });
    } catch {
      setTheme(resolvedTheme === 'dark' ? 'dark' : 'light');
    }
  };

  return (
    <button
      onClick={() => handleThemeChange()}
      className="
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-xl
        border
        border-slate-300
        transition
        hover:bg-slate-100
        dark:border-slate-700
        dark:hover:bg-slate-800
        dark:bg-slate-900
        cursor-pointer
      "
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
