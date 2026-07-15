import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Clipboard, Share, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useSessionStore } from '../../store/sessionStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useTransactionsStore } from '../../store/transactionsStore';
import { supabase } from '../../services/supabase/supabaseClient';

export default function ExportDataScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useSessionStore();
  const [loading, setLoading] = useState(false);
  const [exportData, setExportData] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setExportData(null);

    const isMockSupabase = !process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL.includes('mock-url.supabase.co');

    try {
      if (!user) {
        throw new Error(t('common.signInRequired', 'You must be signed in to export data.'));
      }

      let profileData = null;
      let onboardingData = null;
      let debtsData = [];
      let goalsData = [];
      let transactionsData = [];
      let consentsData = [];
      let insightsData = [];

      if (!isMockSupabase) {
        // Fetch all tables where auth.uid() = user_id
        const [
          { data: profile },
          { data: onboarding },
          { data: debts },
          { data: goals },
          { data: transactions },
          { data: consents },
          { data: insights },
        ] = await Promise.all([
          supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('onboarding_answers').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('debts').select('*').eq('user_id', user.id),
          supabase.from('goals').select('*').eq('user_id', user.id),
          supabase.from('transactions').select('*').eq('user_id', user.id),
          supabase.from('privacy_consents').select('*').eq('user_id', user.id),
          supabase.from('ai_insights').select('*').eq('user_id', user.id),
        ]);
        profileData = profile;
        onboardingData = onboarding;
        debtsData = debts || [];
        goalsData = goals || [];
        transactionsData = transactions || [];
        consentsData = consents || [];
        insightsData = insights || [];
      } else {
        // Hydrate from local stores
        const localAnswers = useOnboardingStore.getState().answers;
        const localDebts = useOnboardingStore.getState().debts;
        const localTransactions = useTransactionsStore.getState().transactions;

        profileData = { preferred_name: localAnswers.preferredName || (user.email || 'guest').split('@')[0] };
        onboardingData = { answers_json: localAnswers };
        debtsData = localDebts;
        goalsData = [
          { name: 'Emergency Protection Fund', targetAmount: 15000, alreadySaved: 3000, targetDate: '2027-07-13', isEssential: true, classification: 'essential', emoji: '🛡️' },
          { name: 'New Laptop for Work', targetAmount: 8000, alreadySaved: 2000, targetDate: '2026-11-13', isEssential: false, classification: 'important', emoji: '💻' }
        ];
        transactionsData = localTransactions;
        consentsData = [
          { consent_type: 'religion', granted: localAnswers.religion_consent_granted || false },
          { consent_type: 'analytics', granted: true }
        ];
        insightsData = [];
      }

      const exportEnvelope = {
        exported_at: new Date().toISOString(),
        user_identity: {
          id: user.id,
          email: user.email || '',
        },
        profile: profileData || {},
        onboarding: onboardingData || {},
        debts: debtsData || [],
        goals: goalsData || [],
        transactions: transactionsData || [],
        privacy_consents: consentsData || [],
        ai_insights: insightsData || [],
      };

      const jsonString = JSON.stringify(exportEnvelope, null, 2);
      setExportData(jsonString);

      if (!isMockSupabase) {
        await supabase.from('data_export_requests').insert({
          user_id: user.id,
          status: 'completed',
        });
      }

      Alert.alert(t('common.success', 'Success'), t('common.exportCompiled', 'Data compiled successfully!'));
    } catch (err: any) {
      Alert.alert(t('common.error', 'Error'), err.message || t('common.exportFailed', 'Failed to assemble export data.'));
      if (user && !isMockSupabase) {
        await supabase.from('data_export_requests').insert({
          user_id: user.id,
          status: 'failed',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (exportData) {
      Clipboard.setString(exportData);
      Alert.alert(t('common.success', 'Success'), t('common.copiedToClipboard', 'JSON payload copied to clipboard.'));
    }
  };

  const handleShare = async () => {
    if (exportData) {
      try {
        await Share.share({
          message: exportData,
          title: 'FinPath Data Export',
        });
      } catch (err: any) {
        Alert.alert(t('common.error', 'Error'), err.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}>
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
              <TouchableOpacity style={styles.actionBtn} onPress={handleCopy}>
                <Ionicons name="copy-outline" size={20} color={COLORS.primary} />
                <Text style={styles.actionBtnText}>{t('settings.exportData.copyBtn')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
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
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    color: COLORS.textPrimary,
  },
});
