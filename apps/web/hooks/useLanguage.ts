'use client';

import i18n, { LANGUAGE_STORAGE_KEY } from '@/i18n';

import { useUpdateProfile } from '@/hooks/mutations/useUpdateProfile';
import { useAuthContext } from '@/contexts/auth.context';

export function useLanguage() {
  
  const { user, loading } = useAuthContext();

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
