'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import vi from './locales/vi.json';

export const LANGUAGE_STORAGE_KEY = 'language';

const getInitialLanguage = () => {
  if (typeof window === 'undefined') {
    return 'en';
  }

  return localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? 'en';
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    vi: { translation: vi },
  },

  fallbackLng: 'en',
  lng: getInitialLanguage(),

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
