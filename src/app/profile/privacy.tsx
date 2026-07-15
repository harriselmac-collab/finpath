import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useSessionStore } from '../../store/sessionStore';
import { supabase } from '../../services/supabase/supabaseClient';

export default function PrivacyCentreScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { answers, setAnswers } = useOnboardingStore();
  const { user } = useSessionStore();

  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  // Special category religion consent
  const [religionConsent, setReligionConsent] = useState(answers.religion_consent_granted || false);
  const [religionVal, setReligionVal] = useState(answers.religion || 'Prefer not to say');

  const handleReligionToggle = async (val: boolean) => {
    setReligionConsent(val);
    if (!val) {
      setReligionVal('Prefer not to say');
    }
  };

  const handleSaveConsents = async () => {
    try {
      const updatedAnswers = {
        ...answers,
        religion_consent_granted: religionConsent,
        religion: religionVal,
      };

      if (user) {
        const isMockSupabase = !process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL.includes('mock-url.supabase.co');
        if (!isMockSupabase) {
          await supabase.from('privacy_consents').upsert([
            {
              user_id: user.id,
              consent_type: 'religion',
              granted: religionConsent,
              policy_version: '1.0.0',
              updated_at: new Date().toISOString(),
            },
            {
              user_id: user.id,
              consent_type: 'analytics',
              granted: analytics,
              policy_version: '1.0.0',
              updated_at: new Date().toISOString(),
            },
          ]);
        }
      }

      setAnswers(updatedAnswers);
      Alert.alert(t('common.success', 'Success'), t('common.saved', 'Privacy consents updated successfully.'), [
        { text: t('common.ok', 'OK'), onPress: () => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile') }
      ]);
    } catch (err: any) {
      Alert.alert(t('common.error', 'Error'), err.message || t('common.saveFailed', 'Failed to save consents.'));
    }
  };

  const renderReligionOption = (label: string, value: string) => (
    <TouchableOpacity
      key={value}
      style={[styles.optionItem, religionVal === value && styles.optionItemSelected]}
      onPress={() => setReligionVal(value)}
    >
      <Text style={[styles.optionText, religionVal === value && styles.optionTextSelected]}>{label}</Text>
      {religionVal === value && (
        <Ionicons name="checkmark" size={18} color={COLORS.darkEmerald} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.privacy.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Core Principles */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{t('settings.privacy.policyHeader')}</Text>
          <Text style={styles.bodyText}>{t('settings.privacy.policyDesc')}</Text>
        </Card>

        {/* Sensitive Data (GDPR religion special category) */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{t('settings.privacy.sensitiveHeader')}</Text>
          <Text style={styles.bodyText}>{t('settings.privacy.sensitiveDesc')}</Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleTitle}>{t('settings.privacy.culturalTitle')}</Text>
              <Text style={styles.toggleDesc}>{t('settings.privacy.culturalDesc')}</Text>
            </View>
            <Switch
              value={religionConsent}
              onValueChange={handleReligionToggle}
              trackColor={{ false: COLORS.outlineVariant, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          {religionConsent && (
            <View style={styles.optionsList}>
              <Text style={styles.optionsHeader}>{t('settings.privacy.focusHeader')}</Text>
              {renderReligionOption(t('settings.privacy.focusPreferNotToSay'), 'Prefer not to say')}
              {renderReligionOption(t('settings.privacy.focusMuslim'), 'Muslim')}
              {renderReligionOption(t('settings.privacy.focusChristian'), 'Christian')}
              {renderReligionOption(t('settings.privacy.focusJewish'), 'Jewish')}
              {renderReligionOption(t('settings.privacy.focusHindu'), 'Hindu')}
            </View>
          )}
        </Card>

        {/* General Tracking */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{t('settings.privacy.trackingHeader')}</Text>
          
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleTitle}>{t('settings.privacy.crashTitle')}</Text>
              <Text style={styles.toggleDesc}>{t('settings.privacy.crashDesc')}</Text>
            </View>
            <Switch
              value={analytics}
              onValueChange={setAnalytics}
              trackColor={{ false: COLORS.outlineVariant, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleTitle}>{t('settings.privacy.marketingTitle')}</Text>
              <Text style={styles.toggleDesc}>{t('settings.privacy.marketingDesc')}</Text>
            </View>
            <Switch
              value={marketing}
              onValueChange={setMarketing}
              trackColor={{ false: COLORS.outlineVariant, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </Card>

        {/* Core Actions */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{t('settings.privacy.rightsHeader')}</Text>
          
          <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/profile/ai-consent')}>
            <View style={styles.actionLeft}>
              <Ionicons name="sparkles-outline" size={20} color={COLORS.primary} style={styles.iconSpacing} />
              <Text style={styles.actionText}>{t('settings.privacy.aiConsent')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/profile/export-data')}>
            <View style={styles.actionLeft}>
              <Ionicons name="download-outline" size={20} color={COLORS.primary} style={styles.iconSpacing} />
              <Text style={styles.actionText}>{t('settings.privacy.exportData')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/profile/delete-account')}>
            <View style={styles.actionLeft}>
              <Ionicons name="trash-outline" size={20} color={COLORS.error} style={styles.iconSpacing} />
              <Text style={[styles.actionText, styles.destructiveText]}>{t('settings.privacy.deleteAccount')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.error} />
          </TouchableOpacity>
        </Card>

        <Button title={t('settings.privacy.save')} onPress={handleSaveConsents} style={styles.saveBtn} />
        <View style={{ height: 50 }} />
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
  sectionCard: {
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
    marginBottom: SPACING.sm,
  },
  bodyText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    lineHeight: 16,
    marginBottom: SPACING.md,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  toggleText: {
    flex: 1,
    marginRight: SPACING.md,
  },
  toggleTitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  toggleDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 14,
  },
  optionsList: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },
  optionsHeader: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.surface,
  },
  optionItemSelected: {
    borderColor: COLORS.emerald,
    backgroundColor: COLORS.mintBackground,
  },
  optionText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
  },
  optionTextSelected: {
    color: COLORS.darkEmerald,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconSpacing: {
    marginRight: SPACING.md,
  },
  actionText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  destructiveText: {
    color: COLORS.error,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
    marginVertical: SPACING.xs,
  },
  saveBtn: {
    width: '100%',
    marginTop: SPACING.sm,
  },
});
