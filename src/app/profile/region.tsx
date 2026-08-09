import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, I18nManager } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import AppText from '../../components/Text/AppText';
import {
  DEFAULT_CURRENCY,
  getCurrencyOptionLabel,
  getCurrencySymbol,
  normalizeCurrencyCode,
  SUPPORTED_CURRENCIES,
} from '../../constants/currencies';
import { useOnboardingStore } from '../../store/onboardingStore';
import { Input } from '../../components/ui/Input';
import { FlagIcon } from '../../components/ui/FlagIcon';
import { getCountries, normalizeCountryCode } from '../../services/localization/countries';

export default function RegionScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { answers, setAnswers } = useOnboardingStore();
  const [savedCurrency, setSavedCurrency] = useState<string | null>(null);
  const [countrySearch, setCountrySearch] = useState('');
  const locale = i18n.resolvedLanguage || i18n.language;
  const selectedCurrency = normalizeCurrencyCode(answers.currency || DEFAULT_CURRENCY);
  const selectedCountry = normalizeCountryCode(answers.country);
  const countries = getCountries(locale);
  const countryQuery = countrySearch.trim().toLocaleLowerCase(locale);
  const visibleCountries = countryQuery
    ? countries.filter(({ code, name }) => code.toLowerCase().includes(countryQuery) || name.toLocaleLowerCase(locale).includes(countryQuery))
    : countries;

  const handleSelectCurrency = (currency: string) => {
    if (currency === answers.currency) return;
    setAnswers({ ...answers, currency });
    setSavedCurrency(currency);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}
          accessibilityRole="button"
          accessibilityLabel={t('profile.edit.back')}
        >
          <Ionicons
            name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'}
            size={24}
            color={COLORS.primary}
            accessible={false}
          />
        </Pressable>
        <AppText
          variant="bodySemiBold"
          style={styles.headerTitle}
          role="heading"
          aria-level={1}
          numberOfLines={1}
        >
          {t('profile.region.title')}
        </AppText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        role="main"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
        <AppText variant="supporting" style={styles.subtitle}>
          {t('profile.region.subtitle')}
        </AppText>

        <AppText variant="sectionTitle" style={styles.currencyTitle}>{t('profile.region.country')}</AppText>
        <Input value={countrySearch} onChangeText={setCountrySearch} placeholder={t('onboarding.minimum.country.search')} />
        <View style={styles.countryList} accessibilityRole="radiogroup">
          {visibleCountries.map((country) => {
            const selected = country.code === selectedCountry;
            return (
              <Pressable
                key={country.code}
                style={[styles.countryOption, selected && styles.currencyOptionSelected]}
                onPress={() => setAnswers({ ...answers, country: country.code })}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
              >
                <FlagIcon countryCode={country.code} size={22} />
                <AppText variant="bodyMedium" style={styles.optionLabel}>{country.name} ({country.code})</AppText>
                {selected ? <Ionicons name="checkmark-circle" size={20} color={COLORS.emerald} /> : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.currencyHeader}>
          <AppText
            variant="sectionTitle"
            style={styles.currencyTitle}
            role="heading"
            aria-level={2}
          >
            {t('profile.region.currencyTitle')}
          </AppText>
          <AppText variant="supporting" style={styles.currencyDescription}>
            {t('profile.region.currencyDescription')}
          </AppText>
        </View>

        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} accessible={false} />
          <AppText variant="supporting" style={styles.noticeText}>
            {t('profile.region.conversionNotice')}
          </AppText>
        </View>

        <View accessibilityRole="radiogroup">
          {SUPPORTED_CURRENCIES.map((currency) => {
            const selected = currency.code === selectedCurrency;
            const localizedName = t(`profile.currencies.${currency.code}`, {
              defaultValue: currency.name,
            });
            const label = getCurrencyOptionLabel(currency, locale, localizedName);

            return (
              <Pressable
                key={currency.code}
                style={[styles.currencyOption, selected && styles.currencyOptionSelected]}
                onPress={() => handleSelectCurrency(currency.code)}
                accessibilityRole="radio"
                accessibilityLabel={label}
                accessibilityState={{ checked: selected }}
              >
                <View style={[styles.symbolBadge, selected && styles.symbolBadgeSelected]}>
                  <AppText variant="bodySemiBold" style={styles.symbolText}>
                    {getCurrencySymbol(currency.code, locale)}
                  </AppText>
                </View>
                <AppText variant="bodySemiBold" style={styles.optionLabel}>
                  {label}
                </AppText>
                {selected ? (
                  <View style={styles.selectedState}>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.emerald} accessible={false} />
                    <AppText variant="labelSm" style={styles.selectedText}>
                      {savedCurrency === currency.code
                        ? t('profile.region.saved')
                        : t('profile.region.selected')}
                    </AppText>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    minHeight: 56,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.primary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  locationCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginBottom: SPACING.lg,
  },
  countryList: { marginTop: SPACING.sm, marginBottom: SPACING.lg },
  countryOption: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.md,
    minHeight: 48,
  },
  locationLabel: {
    color: COLORS.textSecondary,
  },
  locationValue: {
    color: COLORS.textPrimary,
    flexShrink: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
  },
  currencyHeader: {
    marginBottom: SPACING.md,
  },
  currencyTitle: {
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  currencyDescription: {
    color: COLORS.textSecondary,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  currencyOptionSelected: {
    borderColor: COLORS.emerald,
    backgroundColor: COLORS.mintBackground,
  },
  symbolBadge: {
    minWidth: 44,
    height: 36,
    paddingHorizontal: SPACING.xs,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
  },
  symbolBadgeSelected: {
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  symbolText: {
    color: COLORS.primary,
  },
  optionLabel: {
    color: COLORS.textPrimary,
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  selectedState: {
    alignItems: 'center',
    gap: 2,
  },
  selectedText: {
    color: COLORS.darkEmerald,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  noticeText: {
    color: COLORS.textSecondary,
    flex: 1,
  },
});
