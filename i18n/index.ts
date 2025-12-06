import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

import ru from './locales/ru.json';
import en from './locales/en.json';
import he from './locales/he.json';

const resources = {
  ru: { translation: ru },
  en: { translation: en },
  he: { translation: he },
};


const getDeviceLanguage = (): string => {
  const locales = RNLocalize.getLocales();
  if (locales.length > 0) {
    const languageCode = locales[0].languageCode;
  
    if (['ru', 'en', 'he'].includes(languageCode)) {
      return languageCode;
    }
  }
  return 'ru'; 
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'ru',
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
