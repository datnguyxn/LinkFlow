import i18n, { LANGUAGE_STORAGE_KEY } from '@/i18n';
import type { UserProfile } from '@/types/auth';

export function applyUserPreferences(user: UserProfile, setTheme: (theme: string) => void) {
  const theme = user.theme == 'LIGHT' ? 'light' : user.theme == 'SYSTEM' ? 'system' : 'dark';

  localStorage.setItem(LANGUAGE_STORAGE_KEY, user.language);

  i18n.changeLanguage(user.language);

  setTheme(theme);
}
