'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

import { useUser } from './useUser';
import { userService } from '@/services/user.service';
import { applyUserPreferences } from '@/lib/user-preferences';
import { useLanguage } from './useLanguage';

export function useInitializeUser() {
  console.log('Initialize mounted');

  const { setUser } = useUser();

  const { setTheme } = useTheme();

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('GET PROFILE');

        const user = await userService.getProfile();

        console.log('PROFILE THEME:', user.theme);

        setUser(user);

        applyUserPreferences(user, setTheme);
      } catch (error) {
        console.error(error);
      }
    };

    initialize();
  }, []);
}
