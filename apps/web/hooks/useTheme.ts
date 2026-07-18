'use client';

import { useTheme } from 'next-themes';

import { useMe } from '@/hooks/queries/useMe';
import { useUpdateProfile } from '@/hooks/mutations/useUpdateProfile';

export function useAppTheme() {
  const { setTheme } = useTheme();

  const { data: user } = useMe();

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
