// // import i18n from 'i18next';
// // import { initReactI18next } from 'react-i18next';
// // import en from './en.json';
// // import fr from './fr.json';
// // import ar from './ar.json';

// // i18n.use(initReactI18next).init({
// //   resources: {
// //     fr: { translation: fr },
// //     ar: { translation: ar },
// //     en: { translation: en },
// //   },
// //   fallbackLng: 'ar',
// //   debug: false,
// //   interpolation: { escapeValue: false },
// // });

// // export default i18n;

// // i18n.ts
// import i18n from 'i18next';
// import { initReactI18next } from 'react-i18next';
// import LanguageDetector from 'i18next-browser-languagedetector';
// import en from './en.json';
// import fr from './fr.json';
// import ar from './ar.json';

// i18n
//   .use(LanguageDetector) // Enables reading from localStorage and cookies
//   .use(initReactI18next)
//   .init({
//       resources: {
//     fr: { translation: fr },
//     ar: { translation: ar },
//     en: { translation: en },
//   },
//     fallbackLng: 'ar',
//     detection: {
//       order: ['localStorage', 'cookie', 'navigator'],
//       caches: ['localStorage', 'cookie'],
//       lookupLocalStorage: 'i18nextLng',
//       lookupCookie: 'i18nextLng',
//     },
//     interpolation: {
//       escapeValue: false,
//     },
//   });

// export default i18n;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en.json';
import fr from './fr.json';
import ar from './ar.json';

const resources = {
  ar: { translation: ar },
  en: { translation: en },
  fr: { translation: fr },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    supportedLngs: ['ar', 'en', 'fr'],
    detection: {
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      lookupCookie: 'i18nextLng',
      caches: ['localStorage', 'cookie'],
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Prevents SSR suspense blocking in App Router
    },
  });

export default i18n;