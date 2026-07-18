'use client';

import i18n, { LANGUAGE_STORAGE_KEY } from '@/i18n';

import { useMe } from '@/hooks/queries/useMe';
import { useUpdateProfile } from '@/hooks/mutations/useUpdateProfile';

export function useLanguage() {
  const { data: user } = useMe();

  const updateProfile = useUpdateProfile();

  const changeLanguage = async (language: 'en' | 'vi') => {
    if (!user || user.language === language) return;

    // Update UI ngay lập tức
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    i18n.changeLanguage(language);

    try {
      await updateProfile.mutateAsync({
        language,
      });
    } catch {
      // rollback
      localStorage.setItem(LANGUAGE_STORAGE_KEY, user.language);
      i18n.changeLanguage(user.language);
    }
  };

  return {
    language: user?.language ?? 'en',
    changeLanguage,
    isPending: updateProfile.isPending,
  };
}
