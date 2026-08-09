import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, I18nManager, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { FlagIcon } from '../../components/ui/FlagIcon';
import { LANGUAGES } from '../../components/ui/LanguageSelector';
import {
  isRtlLanguage,
  normalizeLanguageCode,
} from '../../services/localization/languages';
import AppText from '../../components/Text/AppText';

export default function LanguageScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const handleLanguageChange = async (lang: string) => {
    try {
      await AsyncStorage.setItem('user-language', lang);
      await i18n.changeLanguage(lang);
      const translated = i18n.getFixedT(lang);
      
      const isRTL = isRtlLanguage(lang);
      
      // Update HTML root element dir for browser views
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
      }

      if (I18nManager.isRTL !== isRTL) {
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);
        
        if (Platform.OS !== 'web') {
          Alert.alert(
            translated('common.reloadRequired', 'Reload Required'),
            translated('common.reloadRequiredMsg', 'Please restart the application to apply the Right-To-Left layout changes.'),
          );
        } else {
          window.location.reload();
        }
      } else {
        if (Platform.OS === 'web') {
          window.location.reload();
        } else {
          Alert.alert(translated('common.success', 'Success'), translated('common.languageUpdated', 'Language updated successfully.'));
        }
      }
    } catch {
      Alert.alert(t('common.error', 'Error'), t('common.saveFailed', 'Failed to save language preference.'));
    }
  };

  const renderLangOption = (lang: (typeof LANGUAGES)[number]) => {
    const isSelected = normalizeLanguageCode(i18n.resolvedLanguage || i18n.language) === lang.key;
    return (
      <TouchableOpacity
        key={lang.key}
        style={[styles.langItem, isSelected && styles.langItemSelected]}
        onPress={() => handleLanguageChange(lang.key)}
        accessibilityRole="radio"
        accessibilityLabel={`${lang.label}, ${lang.shortLabel}`}
        accessibilityState={{ selected: isSelected }}
      >
        <View style={styles.langIdentity}>
          <FlagIcon countryCode={lang.countryCode} size={28} />
          <View>
            <AppText
              variant="bodyMedium"
              style={[
                styles.langText,
                lang.key === 'ar' && styles.arabicLanguageText,
                isSelected && styles.langTextSelected,
              ]}
            >
              {lang.label}
            </AppText>
            <AppText variant="labelSm" style={styles.languageCode}>{lang.shortLabel}</AppText>
          </View>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={20} color={COLORS.emerald} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <AppText variant="bodySemiBold" style={styles.headerTitle}>{t('profile.rows.language', 'Language Settings')}</AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <AppText variant="bodyMedium" style={styles.sectionHeader}>{t('common.chooseLanguage', 'Choose Application Language')}</AppText>
          <View style={styles.list}>
            {LANGUAGES.map((lang) => renderLangOption(lang))}
          </View>
        </Card>
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
    height: 56,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.primary,
    fontWeight: '700',
  },
  scrollContent: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  card: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  sectionHeader: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  list: {
    gap: SPACING.xs,
  },
  langItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surface,
  },
  langItemSelected: {
    borderColor: COLORS.emerald,
    backgroundColor: COLORS.mintBackground,
  },
  langIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  langText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  languageCode: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  langTextSelected: {
    color: COLORS.darkEmerald,
  },
  arabicLanguageText: {
    fontFamily: 'Cairo',
  },
});
