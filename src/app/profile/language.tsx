import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, I18nManager, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { LANGUAGES } from '../../components/ui/LanguageSelector';

export default function LanguageScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const handleLanguageChange = async (lang: string) => {
    try {
      await AsyncStorage.setItem('user-language', lang);
      await i18n.changeLanguage(lang);
      
      const isRTL = lang === 'ar';
      
      // Update HTML root element dir for browser views
      if (typeof document !== 'undefined') {
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      }

      if (I18nManager.isRTL !== isRTL) {
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);
        
        if (Platform.OS !== 'web') {
          Alert.alert(
            t('common.reloadRequired', 'Reload Required'),
            t('common.reloadRequiredMsg', 'Please restart the application to apply the Right-To-Left layout changes.')
          );
        } else {
          window.location.reload();
        }
      } else {
        if (Platform.OS === 'web') {
          window.location.reload();
        } else {
          Alert.alert(t('common.success', 'Success'), t('common.languageUpdated', 'Language updated successfully.'));
        }
      }
    } catch (err: any) {
      Alert.alert(t('common.error', 'Error'), t('common.saveFailed', 'Failed to save language preference.'));
    }
  };

  const renderLangOption = (lang: typeof LANGUAGES[0]) => {
    const isSelected = i18n.language === lang.key;
    return (
      <TouchableOpacity
        key={lang.key}
        style={[styles.langItem, isSelected && styles.langItemSelected]}
        onPress={() => handleLanguageChange(lang.key)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
      >
        <Text style={[styles.langText, isSelected && styles.langTextSelected]}>{lang.label}</Text>
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
        <Text style={styles.headerTitle}>{t('profile.rows.language', 'Language Settings')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Text style={styles.sectionHeader}>{t('common.chooseLanguage', 'Choose Application Language')}</Text>
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
  langText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  langTextSelected: {
    color: COLORS.darkEmerald,
  },
});
