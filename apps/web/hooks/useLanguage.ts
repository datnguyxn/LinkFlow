'use client';

import i18n, { LANGUAGE_STORAGE_KEY } from '@/i18n';

import { useUser } from '@/hooks/useUser';

export function useLanguage() {
  const { user, updateUser, updateUserProfile } = useUser();

  const changeLanguage = async (lang: string) => {
    if (!user) return;

    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);

    i18n.changeLanguage(lang);

    updateUser({
      ...user,
      language: lang,
    });

    try {
      await updateUserProfile({
        language: lang,
      });
    } catch {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, user.language);

      i18n.changeLanguage(user.language);

      updateUser(user);
    }
  };

  return {
    language: user?.language ?? 'en',

    changeLanguage,
  };
}
