import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, I18nManager, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../constants/theme';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { SectionHeader } from '../../../components/ui/SectionHeader';
import { LanguageSelector, LANGUAGES } from '../../../components/ui/LanguageSelector';
import { useOnboardingStore } from '../../../store/onboardingStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { answers, resetOnboarding } = useOnboardingStore();


  const handleReset = () => {
    Alert.alert(
      t('profile.resetConfirmTitle'),
      t('profile.resetConfirmMessage'),
      [
        { text: t('profile.resetConfirmCancel'), style: 'cancel' },
        {
          text: t('profile.resetConfirmReset'),
          style: 'destructive',
          onPress: () => {
            resetOnboarding();
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang).then(() => {
      const isRTL = lang === 'ar';
      
      // Update browser HTML root direction instantly on web
      if (typeof document !== 'undefined') {
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      }

      if (I18nManager.isRTL !== isRTL) {
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);
        
        if (Platform.OS !== 'web') {
          Alert.alert(
            'Reload Required',
            'Please restart the application to apply the Right-To-Left layout changes.'
          );
        } else {
          // Force reload browser view to re-evaluate RTL styles
          window.location.reload();
        }
      }

      const selectedLang = LANGUAGES.find((l) => l.key === lang);
      if (Platform.OS === 'web' && I18nManager.isRTL === isRTL) {
        Alert.alert(
          'Language Updated',
          `Application language set to ${selectedLang?.label || lang.toUpperCase()}`
        );
      } else if (Platform.OS !== 'web') {
        Alert.alert(
          'Language Updated',
          `Application language set to ${selectedLang?.label || lang.toUpperCase()}`
        );
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <Card style={styles.userCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {answers.preferredName ? answers.preferredName.charAt(0).toUpperCase() : 'G'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{answers.preferredName || 'Guest User'}</Text>
              <Text style={styles.userEmployment}>
                {answers.employmentStatus ? answers.employmentStatus.toUpperCase() : 'Not Set'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Account Details */}
        <Card style={styles.detailsCard}>
          <SectionHeader
            title={t('profile.detailsTitle')}
            subtitle={t('profile.detailsSubtitle')}
            icon="person-outline"
          />
          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('profile.country')}</Text>
              <Text style={styles.detailValue}>{answers.country || 'N/A'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('profile.city')}</Text>
              <Text style={styles.detailValue}>{answers.city || 'N/A'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('profile.currency')}</Text>
              <Text style={styles.detailValue}>{answers.currency || 'MAD'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('profile.ageRange')}</Text>
              <Text style={styles.detailValue}>{answers.ageRange || 'N/A'}</Text>
            </View>
          </View>
        </Card>


        {/* Settings */}
        <Card style={styles.linksCard}>
          <SectionHeader
            title={t('profile.settingsTitle')}
            subtitle={t('profile.settingsSubtitle')}
            icon="settings-outline"
          />
          <View style={styles.linkRow}>
            <View style={styles.linkLeft}>
              <View style={styles.linkIconBox}>
                <Ionicons name="globe-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.linkTextContainer}>
                <Text style={styles.linkText}>{t('profile.language')}</Text>
                <Text style={styles.linkSubtext}>{t('profile.languageSubtext')}</Text>
              </View>
            </View>
            <LanguageSelector
              selectedLanguage={i18n.language}
              onSelectLanguage={handleLanguageChange}
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/debts')}>
            <View style={styles.linkLeft}>
              <View style={styles.linkIconBox}>
                <Ionicons name="card-outline" size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.linkText}>{t('profile.debtTracker')}</Text>
                <Text style={styles.linkSubtext}>{t('profile.debtTrackerSubtext')}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.linkRow} onPress={() => {}}>
            <View style={styles.linkLeft}>
              <View style={styles.linkIconBox}>
                <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.linkText}>{t('profile.security')}</Text>
                <Text style={styles.linkSubtext}>{t('profile.securitySubtext')}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.linkRow} onPress={() => {}}>
            <View style={styles.linkLeft}>
              <View style={styles.linkIconBox}>
                <Ionicons name="help-circle-outline" size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.linkText}>{t('profile.support')}</Text>
                <Text style={styles.linkSubtext}>{t('profile.supportSubtext')}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Button
            title={t('profile.resetBtn')}
            onPress={handleReset}
            variant="destructive"
            style={styles.resetBtn}
          />
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  userCard: {
    padding: SPACING.md,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.white,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...TYPOGRAPHY.bodySemiBold,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  userEmployment: {
    ...TYPOGRAPHY.labelSm,
    fontWeight: '700',
    color: COLORS.emerald,
  },
  detailsCard: {
    padding: SPACING.md,
  },
  detailsList: {
    marginTop: SPACING.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  detailLabel: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
  },
  detailValue: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
  },
  linksCard: {
    padding: SPACING.md,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  linkIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkTextContainer: {
    flex: 1,
  },
  linkText: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  linkSubtext: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dangerZone: {
    marginTop: SPACING.sm,
  },
  resetBtn: {
    marginTop: 0,
  },
});

