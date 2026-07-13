import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import path from 'node:path';

export async function registerI18n() {
  await i18next.use(Backend).init({
    lng: 'en',
    fallbackLng: 'vi',

    backend: {
      loadPath: path.join(process.cwd(), 'src/locales/{{lng}}/{{ns}}.json'),
    },
    ns: ['common', 'validation'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18next;
