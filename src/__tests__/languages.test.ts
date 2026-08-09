import { describe, expect, it } from '@jest/globals';

import {
  getLanguageOption,
  isRtlLanguage,
  normalizeLanguageCode,
  SUPPORTED_LANGUAGES,
} from '../services/localization/languages';
import { dashboardPlanTranslations } from '../constants/translations/dashboardPlan';
import { essentialExpensesTranslations } from '../constants/translations/essentialExpenses';
import { planDetailsTranslations } from '../constants/translations/planDetails';
import { onboardingFlowTranslations } from '../constants/translations/onboardingFlow';
import { profileTranslations } from '../constants/translations/profileTranslations';
import { supportFormTranslations, supportSurfaceTranslations } from '../constants/translations/supportSurfaces';
import { goalTranslations } from '../constants/translations/goals';
import { incomeScheduleTranslations } from '../constants/translations/incomeSchedule';
import { minimumOnboardingTranslations } from '../constants/translations/minimumOnboarding';
import { legalDocuments } from '../constants/legalDocuments';
import { PROGRESSIVE_PROFILE_QUESTIONS } from '../features/onboarding/quizFlow';

const getTranslationKeys = (value: object, prefix = ''): string[] =>
  Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof child === 'string' ? [path] : getTranslationKeys(child, path);
  });

describe('supported languages', () => {
  it('provides unique names and flags for every locale', () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(9);
    expect(new Set(SUPPORTED_LANGUAGES.map(({ key }) => key)).size).toBe(9);
    expect(SUPPORTED_LANGUAGES.every(({ label, flag }) => label.length > 0 && Array.from(flag).length === 2)).toBe(true);
  });

  it('normalizes regional locales and falls back safely', () => {
    expect(normalizeLanguageCode('pt-BR')).toBe('pt');
    expect(normalizeLanguageCode('de-DE')).toBe('de');
    expect(normalizeLanguageCode('unknown')).toBe('en');
    expect(getLanguageOption('tr-TR').label).toBe('Türkçe');
  });

  it('keeps right-to-left layout limited to Arabic', () => {
    expect(isRtlLanguage('ar-MA')).toBe(true);
    expect(isRtlLanguage('fr-MA')).toBe(false);
  });

  it('provides the complete monthly-plan dashboard copy in every supported locale', () => {
    const expectedKeys = Object.keys(dashboardPlanTranslations.en).sort();
    const expectedGuidanceKeys = Object.keys(dashboardPlanTranslations.en.guidance).sort();

    SUPPORTED_LANGUAGES.forEach(({ key }) => {
      const translation = dashboardPlanTranslations[key];
      expect(Object.keys(translation).sort()).toEqual(expectedKeys);
      expect(Object.keys(translation.guidance).sort()).toEqual(expectedGuidanceKeys);
    });
  });

  it('provides the complete essential-expense review copy in every supported locale', () => {
    const expectedKeys = Object.keys(essentialExpensesTranslations.en).sort();

    SUPPORTED_LANGUAGES.forEach(({ key }) => {
      expect(Object.keys(essentialExpensesTranslations[key]).sort()).toEqual(expectedKeys);
    });
  });

  it('provides the complete plan-detail copy in every supported locale', () => {
    const expectedKeys = Object.keys(planDetailsTranslations.en).sort();

    SUPPORTED_LANGUAGES.forEach(({ key }) => {
      expect(Object.keys(planDetailsTranslations[key]).sort()).toEqual(expectedKeys);
    });
  });

  it('provides complete onboarding flow copy and all questions in added locales', () => {
    const groups = ['flow', 'options', 'placeholders', 'validation', 'review'] as const;
    const addedLocales = ['es', 'de', 'pt', 'it', 'nl', 'tr'] as const;
    const questionIds = PROGRESSIVE_PROFILE_QUESTIONS.map(({ id }) => id).sort();

    SUPPORTED_LANGUAGES.forEach(({ key }) => {
      groups.forEach((group) => {
        expect(Object.keys(onboardingFlowTranslations[key][group]).sort())
          .toEqual(Object.keys(onboardingFlowTranslations.en[group]).sort());
      });
    });

    addedLocales.forEach((locale) => {
      expect(Object.keys(onboardingFlowTranslations[locale].questions).sort()).toEqual(questionIds);
    });
  });

  it('provides complete accessibility and FAQ copy in every supported locale', () => {
    const expectedAccessibilityKeys = Object.keys(supportSurfaceTranslations.en.accessibility).sort();
    const expectedFaqKeys = Object.keys(supportSurfaceTranslations.en.faq).sort();

    SUPPORTED_LANGUAGES.forEach(({ key }) => {
      expect(Object.keys(supportSurfaceTranslations[key].accessibility).sort())
        .toEqual(expectedAccessibilityKeys);
      expect(Object.keys(supportSurfaceTranslations[key].faq).sort()).toEqual(expectedFaqKeys);
    });
  });

  it('provides complete contact and problem-report copy in every supported locale', () => {
    const expectedKeys = getTranslationKeys(supportFormTranslations.en).sort();

    SUPPORTED_LANGUAGES.forEach(({ key }) => {
      expect(getTranslationKeys(supportFormTranslations[key]).sort()).toEqual(expectedKeys);
    });
  });

  it('provides complete Profile and edit-photo copy in every supported locale', () => {
    const expectedKeys = getTranslationKeys(profileTranslations.en).sort();

    SUPPORTED_LANGUAGES.forEach(({ key }) => {
      const translation = profileTranslations[key];
      expect(getTranslationKeys(translation).sort()).toEqual(expectedKeys);
      expect(getTranslationKeys(translation).every((path) => {
        const text = path.split('.').reduce<unknown>(
          (value, segment) => (value as Record<string, unknown>)[segment],
          translation,
        );
        return typeof text === 'string' && text.trim().length > 0;
      })).toBe(true);
    });
  });

  it('provides complete minimum onboarding and income-schedule copy in every supported locale', () => {
    const minimumKeys = getTranslationKeys(minimumOnboardingTranslations.en).sort();
    const incomeScheduleKeys = getTranslationKeys(incomeScheduleTranslations.en).sort();

    SUPPORTED_LANGUAGES.forEach(({ key }) => {
      expect(getTranslationKeys(minimumOnboardingTranslations[key]).sort()).toEqual(minimumKeys);
      expect(getTranslationKeys(incomeScheduleTranslations[key]).sort()).toEqual(incomeScheduleKeys);
    });
  });

  it('provides complete goals copy in every supported locale', () => {
    const expectedKeys = getTranslationKeys(goalTranslations.en).sort();

    SUPPORTED_LANGUAGES.forEach(({ key }) => {
      expect(getTranslationKeys(goalTranslations[key]).sort()).toEqual(expectedKeys);
    });
  });

  it('provides complete, placeholder-free legal documents in every supported locale', () => {
    SUPPORTED_LANGUAGES.forEach(({ key }) => {
      const documents = legalDocuments[key];
      expect(Object.keys(documents).sort()).toEqual(['financial', 'privacy', 'terms']);
      Object.values(documents).forEach((document) => {
        expect(document.title.trim()).not.toBe('');
        expect(document.meta).toContain('1.0.0');
        expect(document.sections.length).toBeGreaterThanOrEqual(5);
        const serialized = JSON.stringify(document);
        expect(serialized).not.toMatch(/\[[A-Z _-]+\]/);
        expect(serialized).not.toMatch(/FinPath|Gemini/);
      });
    });
  });
});
