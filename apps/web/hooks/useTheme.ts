'use client';

import { useTheme } from 'next-themes';

import { useUser } from '@/hooks/useUser';

export function useAppTheme() {
  const { setTheme } = useTheme();

  const {
    user,

    updateUser,

    updateUserProfile,
  } = useUser();

  const changeTheme = async (theme: 'LIGHT' | 'DARK' | 'SYSTEM') => {
    if (!user) return;

    setTheme(theme);

    updateUser({
      ...user,

      theme,
    });

    try {
      await updateUserProfile({
        ...user,
        theme,
      });
    } catch {
      setTheme(user.theme);

      updateUser(user);
    }
  };

  return {
    theme: user?.theme ?? 'SYSTEM',

    changeTheme,
  };
}
