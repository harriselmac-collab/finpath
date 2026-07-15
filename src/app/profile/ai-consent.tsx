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

export default function AiConsentScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { answers, setAnswers } = useOnboardingStore();
  const { user } = useSessionStore();

  const [aiExplanations, setAiExplanations] = useState(answers.ai_consent_granted || false);
  const [saveHistory, setSaveHistory] = useState(answers.ai_save_history !== false);
  const [includeNotes, setIncludeNotes] = useState(answers.ai_include_notes === true);

  const handleSave = async () => {
    try {
      const updatedAnswers = {
        ...answers,
        ai_consent_granted: aiExplanations,
        ai_save_history: saveHistory,
        ai_include_notes: includeNotes,
      };

      if (user) {
        const isMockSupabase = !process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL.includes('mock-url.supabase.co');
        if (!isMockSupabase) {
          await supabase.from('privacy_consents').upsert({
            user_id: user.id,
            consent_type: 'ai_explanations',
            granted: aiExplanations,
            policy_version: '1.0.0',
            updated_at: new Date().toISOString(),
          });
        }
      }

      setAnswers(updatedAnswers);
      Alert.alert(t('common.success', 'Success'), t('common.saved', 'AI preferences saved successfully.'), [
        { text: t('common.ok', 'OK'), onPress: () => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile') }
      ]);
    } catch (err: any) {
      Alert.alert(t('common.error', 'Error'), err.message || t('common.saveFailed', 'Failed to save preferences.'));
    }
  };

  const handleDeleteHistory = () => {
    Alert.alert(
      t('common.deleteHistoryConfirmTitle', 'Delete AI History?'),
      t('common.deleteHistoryConfirmMsg', 'This will permanently delete all your generated FinPath Intelligence insights and recommendations from the server database. This cannot be undone.'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.delete', 'Delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              if (user) {
                const isMockSupabase = !process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL.includes('mock-url.supabase.co');
                if (!isMockSupabase) {
                  await supabase.from('ai_insights').delete().eq('user_id', user.id);
                }
              }
              Alert.alert(t('common.success', 'Success'), t('common.historyDeleted', 'Successfully deleted AI insights history.'));
            } catch (err: any) {
              Alert.alert(t('common.error', 'Error'), err.message || t('common.deleteFailed', 'Failed to delete history.'));
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.aiConsent.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Core AI Details */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{t('settings.aiConsent.intelligenceHeader')}</Text>
          <Text style={styles.bodyText}>{t('settings.aiConsent.intelligenceDesc')}</Text>
          <View style={styles.bulletItem}>
            <Ionicons name="shield-checkmark" size={16} color={COLORS.emerald} style={styles.bulletIcon} />
            <Text style={styles.bulletText}>{t('settings.aiConsent.bullet1')}</Text>
          </View>
          <View style={styles.bulletItem}>
            <Ionicons name="lock-closed" size={16} color={COLORS.emerald} style={styles.bulletIcon} />
            <Text style={styles.bulletText}>{t('settings.aiConsent.bullet2')}</Text>
          </View>
          <View style={styles.bulletItem}>
            <Ionicons name="globe" size={16} color={COLORS.emerald} style={styles.bulletIcon} />
            <Text style={styles.bulletText}>{t('settings.aiConsent.bullet3')}</Text>
          </View>
        </Card>

        {/* AI Toggles */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{t('settings.aiConsent.preferencesHeader')}</Text>

          {/* Personalized Insights Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleTitle}>{t('settings.aiConsent.insightsTitle')}</Text>
              <Text style={styles.toggleDesc}>{t('settings.aiConsent.insightsDesc')}</Text>
            </View>
            <Switch
              value={aiExplanations}
              onValueChange={setAiExplanations}
              trackColor={{ false: COLORS.outlineVariant, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.divider} />

          {/* Save AI History Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleTitle}>{t('settings.aiConsent.historyTitle')}</Text>
              <Text style={styles.toggleDesc}>{t('settings.aiConsent.historyDesc')}</Text>
            </View>
            <Switch
              value={saveHistory}
              onValueChange={setSaveHistory}
              trackColor={{ false: COLORS.outlineVariant, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.divider} />

          {/* Include notes/comments toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleTitle}>{t('settings.aiConsent.notesTitle')}</Text>
              <Text style={styles.toggleDesc}>{t('settings.aiConsent.notesDesc')}</Text>
            </View>
            <Switch
              value={includeNotes}
              onValueChange={setIncludeNotes}
              trackColor={{ false: COLORS.outlineVariant, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </Card>

        {/* Manage Data History */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{t('settings.aiConsent.manageHeader')}</Text>
          <Text style={styles.bodyText}>{t('settings.aiConsent.manageDesc')}</Text>
          <Button
            title={t('settings.aiConsent.deleteBtn')}
            onPress={handleDeleteHistory}
            variant="destructive"
            style={styles.deleteHistoryBtn}
          />
        </Card>

        <Button title={t('settings.aiConsent.save')} onPress={handleSave} style={styles.saveBtn} />
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
    marginBottom: SPACING.md,
  },
  bodyText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    lineHeight: 16,
    marginBottom: SPACING.md,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    paddingRight: SPACING.sm,
  },
  bulletIcon: {
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  bulletText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    lineHeight: 14,
    flex: 1,
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
  divider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
    marginVertical: SPACING.sm,
  },
  deleteHistoryBtn: {
    width: '100%',
  },
  saveBtn: {
    width: '100%',
    marginTop: SPACING.sm,
  },
});
