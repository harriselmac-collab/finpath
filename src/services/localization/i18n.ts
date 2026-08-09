import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';

import en from '../../constants/translations/en.json';
import fr from '../../constants/translations/fr.json';
import ar from '../../constants/translations/ar.json';
import { additionalTranslations } from '../../constants/translations/additional';
import { dashboardPlanTranslations } from '../../constants/translations/dashboardPlan';
import { essentialExpensesTranslations } from '../../constants/translations/essentialExpenses';
import { planDetailsTranslations } from '../../constants/translations/planDetails';
import { onboardingFlowTranslations } from '../../constants/translations/onboardingFlow';
import { minimumOnboardingTranslations } from '../../constants/translations/minimumOnboarding';
import { incomeScheduleTranslations } from '../../constants/translations/incomeSchedule';
import { profileTranslations } from '../../constants/translations/profileTranslations';
import { supportFormTranslations, supportSurfaceTranslations } from '../../constants/translations/supportSurfaces';
import { goalTranslations } from '../../constants/translations/goals';
import { syncStatusTranslations } from '../../constants/translations/syncStatus';
import {
  isRtlLanguage,
  normalizeLanguageCode,
  SUPPORTED_LANGUAGE_CODES,
} from './languages';

const resources = {
  en: { translation: { ...en, goals: goalTranslations.en, sync: syncStatusTranslations.en, profile: { ...en.profile, ...profileTranslations.en }, onboarding: { ...en.onboarding, ...onboardingFlowTranslations.en, ...minimumOnboardingTranslations.en, ...incomeScheduleTranslations.en.onboarding, minimum: { ...minimumOnboardingTranslations.en.minimum, ...incomeScheduleTranslations.en.onboarding.minimum }, essentialExpenses: essentialExpensesTranslations.en }, dashboard: { ...en.dashboard, ...dashboardPlanTranslations.en, ...incomeScheduleTranslations.en.dashboard }, planDetails: planDetailsTranslations.en, support: { ...supportSurfaceTranslations.en, ...supportFormTranslations.en } } },
  fr: { translation: { ...fr, goals: goalTranslations.fr, sync: syncStatusTranslations.fr, profile: { ...fr.profile, ...profileTranslations.fr }, onboarding: { ...fr.onboarding, ...onboardingFlowTranslations.fr, ...minimumOnboardingTranslations.fr, ...incomeScheduleTranslations.fr.onboarding, minimum: { ...minimumOnboardingTranslations.fr.minimum, ...incomeScheduleTranslations.fr.onboarding.minimum }, essentialExpenses: essentialExpensesTranslations.fr }, dashboard: { ...fr.dashboard, ...dashboardPlanTranslations.fr, ...incomeScheduleTranslations.fr.dashboard }, planDetails: planDetailsTranslations.fr, support: { ...supportSurfaceTranslations.fr, ...supportFormTranslations.fr } } },
  ar: { translation: { ...ar, goals: goalTranslations.ar, sync: syncStatusTranslations.ar, profile: { ...ar.profile, ...profileTranslations.ar }, onboarding: { ...ar.onboarding, ...onboardingFlowTranslations.ar, ...minimumOnboardingTranslations.ar, ...incomeScheduleTranslations.ar.onboarding, minimum: { ...minimumOnboardingTranslations.ar.minimum, ...incomeScheduleTranslations.ar.onboarding.minimum }, essentialExpenses: essentialExpensesTranslations.ar }, dashboard: { ...ar.dashboard, ...dashboardPlanTranslations.ar, ...incomeScheduleTranslations.ar.dashboard }, planDetails: planDetailsTranslations.ar, support: { ...supportSurfaceTranslations.ar, ...supportFormTranslations.ar } } },
  es: { translation: { ...additionalTranslations.es, goals: goalTranslations.es, sync: syncStatusTranslations.es, profile: { ...additionalTranslations.es.profile, ...profileTranslations.es }, onboarding: { ...onboardingFlowTranslations.es, ...minimumOnboardingTranslations.es, ...incomeScheduleTranslations.es.onboarding, minimum: { ...minimumOnboardingTranslations.es.minimum, ...incomeScheduleTranslations.es.onboarding.minimum }, essentialExpenses: essentialExpensesTranslations.es }, dashboard: { ...additionalTranslations.es.dashboard, ...dashboardPlanTranslations.es, ...incomeScheduleTranslations.es.dashboard }, planDetails: planDetailsTranslations.es, support: { ...supportSurfaceTranslations.es, ...supportFormTranslations.es } } },
  de: { translation: { ...additionalTranslations.de, goals: goalTranslations.de, sync: syncStatusTranslations.de, profile: { ...additionalTranslations.de.profile, ...profileTranslations.de }, onboarding: { ...onboardingFlowTranslations.de, ...minimumOnboardingTranslations.de, ...incomeScheduleTranslations.de.onboarding, minimum: { ...minimumOnboardingTranslations.de.minimum, ...incomeScheduleTranslations.de.onboarding.minimum }, essentialExpenses: essentialExpensesTranslations.de }, dashboard: { ...additionalTranslations.de.dashboard, ...dashboardPlanTranslations.de, ...incomeScheduleTranslations.de.dashboard }, planDetails: planDetailsTranslations.de, support: { ...supportSurfaceTranslations.de, ...supportFormTranslations.de } } },
  pt: { translation: { ...additionalTranslations.pt, goals: goalTranslations.pt, sync: syncStatusTranslations.pt, profile: { ...additionalTranslations.pt.profile, ...profileTranslations.pt }, onboarding: { ...onboardingFlowTranslations.pt, ...minimumOnboardingTranslations.pt, ...incomeScheduleTranslations.pt.onboarding, minimum: { ...minimumOnboardingTranslations.pt.minimum, ...incomeScheduleTranslations.pt.onboarding.minimum }, essentialExpenses: essentialExpensesTranslations.pt }, dashboard: { ...additionalTranslations.pt.dashboard, ...dashboardPlanTranslations.pt, ...incomeScheduleTranslations.pt.dashboard }, planDetails: planDetailsTranslations.pt, support: { ...supportSurfaceTranslations.pt, ...supportFormTranslations.pt } } },
  it: { translation: { ...additionalTranslations.it, goals: goalTranslations.it, sync: syncStatusTranslations.it, profile: { ...additionalTranslations.it.profile, ...profileTranslations.it }, onboarding: { ...onboardingFlowTranslations.it, ...minimumOnboardingTranslations.it, ...incomeScheduleTranslations.it.onboarding, minimum: { ...minimumOnboardingTranslations.it.minimum, ...incomeScheduleTranslations.it.onboarding.minimum }, essentialExpenses: essentialExpensesTranslations.it }, dashboard: { ...additionalTranslations.it.dashboard, ...dashboardPlanTranslations.it, ...incomeScheduleTranslations.it.dashboard }, planDetails: planDetailsTranslations.it, support: { ...supportSurfaceTranslations.it, ...supportFormTranslations.it } } },
  nl: { translation: { ...additionalTranslations.nl, goals: goalTranslations.nl, sync: syncStatusTranslations.nl, profile: { ...additionalTranslations.nl.profile, ...profileTranslations.nl }, onboarding: { ...onboardingFlowTranslations.nl, ...minimumOnboardingTranslations.nl, ...incomeScheduleTranslations.nl.onboarding, minimum: { ...minimumOnboardingTranslations.nl.minimum, ...incomeScheduleTranslations.nl.onboarding.minimum }, essentialExpenses: essentialExpensesTranslations.nl }, dashboard: { ...additionalTranslations.nl.dashboard, ...dashboardPlanTranslations.nl, ...incomeScheduleTranslations.nl.dashboard }, planDetails: planDetailsTranslations.nl, support: { ...supportSurfaceTranslations.nl, ...supportFormTranslations.nl } } },
  tr: { translation: { ...additionalTranslations.tr, goals: goalTranslations.tr, sync: syncStatusTranslations.tr, profile: { ...additionalTranslations.tr.profile, ...profileTranslations.tr }, onboarding: { ...onboardingFlowTranslations.tr, ...minimumOnboardingTranslations.tr, ...incomeScheduleTranslations.tr.onboarding, minimum: { ...minimumOnboardingTranslations.tr.minimum, ...incomeScheduleTranslations.tr.onboarding.minimum }, essentialExpenses: essentialExpensesTranslations.tr }, dashboard: { ...additionalTranslations.tr.dashboard, ...dashboardPlanTranslations.tr, ...incomeScheduleTranslations.tr.dashboard }, planDetails: planDetailsTranslations.tr, support: { ...supportSurfaceTranslations.tr, ...supportFormTranslations.tr } } },
};

const getSystemLanguage = (): string => {
  const locales = Localization.getLocales();
  return normalizeLanguageCode(locales[0]?.languageCode);
};

const systemLang = getSystemLanguage();

// eslint-disable-next-line import/no-named-as-default-member
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: systemLang,
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGE_CODES,
    load: 'languageOnly',
    interpolation: {
      escapeValue: false, // React already safe from XSS
    },
  });

const isRTL = isRtlLanguage(systemLang);
if (I18nManager.isRTL !== isRTL) {
  I18nManager.allowRTL(isRTL);
  I18nManager.forceRTL(isRTL);
}

// On Web, toggle the HTML direction attribute immediately
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('lang', systemLang);
  document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
}

export default i18n;
export { isRTL };
