import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';

import en from '../../constants/translations/en.json';
import fr from '../../constants/translations/fr.json';
import ar from '../../constants/translations/ar.json';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  ar: { translation: ar },
};

const getSystemLanguage = (): string => {
  const locales = Localization.getLocales();
  if (locales && locales.length > 0) {
    const langCode = locales[0].languageCode;
    if (langCode === 'fr' || langCode === 'ar') {
      return langCode;
    }
  }
  return 'en';
};

const systemLang = getSystemLanguage();

// eslint-disable-next-line import/no-named-as-default-member
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: systemLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safe from XSS
    },
  });

// Handle RTL layout settings for Arabic
const isRTL = systemLang === 'ar';
if (I18nManager.isRTL !== isRTL) {
  I18nManager.allowRTL(isRTL);
  I18nManager.forceRTL(isRTL);
}

// On Web, toggle the HTML direction attribute immediately
if (typeof document !== 'undefined') {
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
}

export default i18n;
export { isRTL };
