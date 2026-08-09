import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useSessionStore } from '../../store/sessionStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useTransactionsStore } from '../../store/transactionsStore';
import { useGoalsStore } from '../../store/goalsStore';
import { useBillsStore } from '../../store/billsStore';
import { useNotificationPreferencesStore } from '../../store/notificationPreferencesStore';
import { isSupabaseConfigured, supabase } from '../../services/supabase/supabaseClient';

export default function ExportDataScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useSessionStore();
  const [loading, setLoading] = useState(false);
  const [exportData, setExportData] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setExportData(null);

    try {
      let profileData = null;
      let onboardingData = null;
      let debtsData = [];
      let goalsData = [];
      let contributionsData = [];
      let billsData = [];
      let transactionsData = [];
      let preferencesData: Record<string, any> = {};
      let consentsData = [];
      let insightsData = [];

      if (isSupabaseConfigured && user) {
        const results = await Promise.all([
          supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('onboarding_answers').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('debts').select('*').eq('user_id', user.id),
          supabase.from('goals').select('*').eq('user_id', user.id),
          supabase.from('goal_contributions').select('*').eq('user_id', user.id),
          supabase.from('recurring_expenses').select('*').eq('user_id', user.id),
          supabase.from('transactions').select('*').eq('user_id', user.id),
          supabase.from('notification_preferences').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('privacy_consents').select('*').eq('user_id', user.id),
          supabase.from('ai_insights').select('*').eq('user_id', user.id),
        ]);
        if (results.some((result) => result.error)) {
          throw new Error(t('common.exportIncomplete', 'Pocket Ahead could not retrieve every record. Nothing was exported; please try again.'));
        }
        profileData = results[0].data;
        onboardingData = results[1].data;
        debtsData = results[2].data || [];
        goalsData = results[3].data || [];
        contributionsData = results[4].data || [];
        billsData = results[5].data || [];
        transactionsData = results[6].data || [];
        preferencesData = results[7].data || {};
        consentsData = results[8].data || [];
        insightsData = results[9].data || [];
      } else {
        // Hydrate from local stores
        const localAnswers = useOnboardingStore.getState().answers;
        const localDebts = useOnboardingStore.getState().debts;
        const localTransactions = useTransactionsStore.getState().transactions;

        profileData = { preferred_name: localAnswers.preferredName || (user?.email || 'guest').split('@')[0] };
        onboardingData = { answers_json: localAnswers };
        debtsData = localDebts;
        goalsData = useGoalsStore.getState().goals;
        contributionsData = useGoalsStore.getState().contributions;
        billsData = useBillsStore.getState().bills;
        transactionsData = localTransactions;
        const localPreferences = useNotificationPreferencesStore.getState();
        preferencesData = {
          bills: localPreferences.bills,
          debts: localPreferences.debts,
          savings: localPreferences.savings,
          goals: localPreferences.goals,
          weeklySummary: localPreferences.weeklySummary,
          monthlyReview: localPreferences.monthlyReview,
          culturalEvents: localPreferences.culturalEvents,
          productUpdates: localPreferences.productUpdates,
          marketing: localPreferences.marketing,
        };
        consentsData = [
          { consent_type: 'religion', granted: localAnswers.religion_consent_granted || false },
        ];
        insightsData = [];
      }

      const exportEnvelope = {
        exported_at: new Date().toISOString(),
        user_identity: {
          id: user?.id || 'local-device-user',
          email: user?.email || '',
        },
        profile: profileData || {},
        onboarding: onboardingData || {},
        debts: debtsData || [],
        goals: goalsData || [],
        goal_contributions: contributionsData,
        recurring_bills: billsData,
        transactions: transactionsData || [],
        notification_preferences: preferencesData,
        privacy_consents: consentsData || [],
        ai_insights: insightsData || [],
      };

      const jsonString = JSON.stringify(exportEnvelope, null, 2);
      setExportData(jsonString);

      if (isSupabaseConfigured && user) {
        const { error: auditError } = await supabase.from('data_export_requests').insert({
          user_id: user.id,
          status: 'completed',
        });
        if (auditError) console.warn('Data export audit record failed.');
      }

      Alert.alert(t('common.success', 'Success'), t('common.exportCompiled', 'Data compiled successfully!'));
    } catch (err: any) {
      Alert.alert(t('common.error', 'Error'), err instanceof Error ? err.message : t('common.exportFailed', 'Failed to assemble export data.'));
      if (user && isSupabaseConfigured) {
        const { error: auditError } = await supabase.from('data_export_requests').insert({
          user_id: user.id,
          status: 'failed',
        });
        if (auditError) console.warn('Data export failure audit record failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (exportData) {
      try {
        if (Platform.OS === 'web') {
          await Share.share({ message: exportData, title: 'Pocket Ahead Data Export' });
          return;
        }
        const exportFile = new File(Paths.cache, `pocket-ahead-export-${Date.now()}.json`);
        exportFile.create({ overwrite: true });
        exportFile.write(exportData);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(exportFile.uri, {
            dialogTitle: t('settings.exportData.shareBtn'),
            mimeType: 'application/json',
          });
          return;
        }
        await Share.share({ message: exportData, title: 'Pocket Ahead Data Export' });
      } catch {
        Alert.alert(t('common.error', 'Error'), t('common.exportShareFailed', 'The export file could not be shared. Please try again.'));
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}
          accessibilityRole="button"
          accessibilityLabel={t('common.back', 'Back')}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.exportData.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{t('settings.exportData.portabilityHeader')}</Text>
          <Text style={styles.bodyText}>{t('settings.exportData.portabilityDesc')}</Text>
          <Text style={styles.bodyText}>{t('settings.exportData.portabilityDesc2')}</Text>

          <Button
            title={loading ? t('common.compiling', 'Compiling JSON data...') : t('settings.exportData.generateBtn')}
            onPress={handleExport}
            disabled={loading}
            style={styles.exportBtn}
          />
        </Card>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>{t('common.fetchingFromDatabase', 'Assembling records from secure databases...')}</Text>
          </View>
        )}

        {exportData && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>{t('settings.exportData.readyHeader')}</Text>
            <Text style={styles.bodyText}>{t('settings.exportData.readyDesc')}</Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => void handleShare()}
                accessibilityRole="button"
                accessibilityLabel={t('settings.exportData.shareBtn')}
              >
                <Ionicons name="share-social-outline" size={20} color={COLORS.primary} />
                <Text style={styles.actionBtnText}>{t('settings.exportData.shareBtn')}</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.jsonPreviewContainer} nestedScrollEnabled={true}>
              <Text style={styles.jsonText}>{exportData}</Text>
            </ScrollView>
          </Card>
        )}
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
  exportBtn: {
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  loadingText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surface,
    gap: SPACING.sm,
  },
  actionBtnText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  jsonPreviewContainer: {
    maxHeight: 250,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: SPACING.sm,
  },
  jsonText: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textPrimary,
  },
});
