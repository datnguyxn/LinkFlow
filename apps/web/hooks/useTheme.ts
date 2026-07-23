'use client';

import { useTheme } from 'next-themes';

import { useUpdateProfile } from '@/hooks/mutations/useUpdateProfile';
import { useAuthContext } from '@/contexts/auth.context';

export function useAppTheme() {
  const { setTheme } = useTheme();

  const { user } = useAuthContext();

  const updateUserProfile = useUpdateProfile();

  const changeTheme = async (theme: 'LIGHT' | 'DARK' | 'SYSTEM') => {
    if (!user) return;

    setTheme(theme);

    try {
      await updateUserProfile.mutateAsync({
        theme,
      });
    } catch {
      setTheme(user.theme);

      // rollback
      await updateUserProfile.mutateAsync({
        theme: user.theme,
      });
    }
  };

  return {
    theme: user?.theme ?? 'SYSTEM',

    changeTheme,
  };
}
