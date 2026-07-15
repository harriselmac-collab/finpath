import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useSessionStore } from '../../store/sessionStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { supabase } from '../../services/supabase/supabaseClient';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, signOut } = useSessionStore();
  const { resetOnboarding } = useOnboardingStore();

  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      Alert.alert(t('common.error', 'Error'), t('common.deleteConfirmFailed', 'Please type DELETE in all caps to confirm.'));
      return;
    }

    Alert.alert(
      t('common.finalConfirmationTitle', 'Final Confirmation Required'),
      t('common.finalConfirmationMsg', 'This will permanently delete your authentication details, custom goals, transactions, assessments, and profile metadata. This cannot be undone. Are you absolutely certain?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.deletePermanently', 'Permanently Delete'),
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              if (user) {
                const isMockSupabase = !process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL.includes('mock-url.supabase.co');
                if (!isMockSupabase) {
                  await supabase.from('account_deletion_requests').insert({
                    user_id: user.id,
                    reason: 'User requested in-app account deletion',
                  });

                  const { error } = await supabase.rpc('delete_user_account');
                  
                  if (error) {
                    throw error;
                  }
                }
              }

              resetOnboarding();
              await signOut();

              Alert.alert(t('common.accountDeletedTitle', 'Account Deleted'), t('common.accountDeletedMsg', 'Your profile and data have been successfully purged.'), [
                { text: t('common.ok', 'OK'), onPress: () => router.replace('/auth') }
              ]);
            } catch (err: any) {
              Alert.alert(t('common.error', 'Error'), err.message || t('common.deleteFailed', 'An error occurred during account deletion.'));
            } finally {
              setLoading(false);
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
        <Text style={styles.headerTitle}>{t('settings.deleteAccount.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Deletion Details */}
        <Card style={[styles.sectionCard, styles.warningCard]}>
          <Ionicons name="warning-outline" size={32} color={COLORS.error} style={styles.warningIcon} />
          <Text style={styles.warningTitle}>{t('settings.deleteAccount.purgeHeader')}</Text>
          <Text style={styles.bodyText}>{t('settings.deleteAccount.purgeDesc')}</Text>
          
          <View style={styles.bulletItem}>
            <Ionicons name="close-circle-outline" size={16} color={COLORS.error} style={styles.bulletIcon} />
            <Text style={styles.bulletText}>{t('settings.deleteAccount.bullet1')}</Text>
          </View>
          <View style={styles.bulletItem}>
            <Ionicons name="close-circle-outline" size={16} color={COLORS.error} style={styles.bulletIcon} />
            <Text style={styles.bulletText}>{t('settings.deleteAccount.bullet2')}</Text>
          </View>
          <View style={styles.bulletItem}>
            <Ionicons name="close-circle-outline" size={16} color={COLORS.error} style={styles.bulletIcon} />
            <Text style={styles.bulletText}>{t('settings.deleteAccount.bullet3')}</Text>
          </View>
          <View style={styles.bulletItem}>
            <Ionicons name="close-circle-outline" size={16} color={COLORS.error} style={styles.bulletIcon} />
            <Text style={styles.bulletText}>{t('settings.deleteAccount.bullet4')}</Text>
          </View>

          <Text style={styles.bodyTextSmall}>{t('settings.deleteAccount.purgeDesc2')}</Text>
        </Card>

        {/* Confirmation Form */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{t('settings.deleteAccount.confirmHeader')}</Text>
          <Text style={styles.bodyText}>{t('settings.deleteAccount.confirmDesc')}</Text>

          <TextInput
            style={styles.input}
            value={confirmText}
            onChangeText={setConfirmText}
            placeholder={t('settings.deleteAccount.confirmPlaceholder')}
            placeholderTextColor={COLORS.textSecondary}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <Button
            title={loading ? t('common.purging', 'Purging account...') : t('settings.deleteAccount.deleteBtn')}
            onPress={handleDelete}
            disabled={loading || confirmText !== 'DELETE'}
            variant="destructive"
            style={styles.deleteBtn}
          />
        </Card>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.error} />
            <Text style={styles.loadingText}>{t('common.processingDeletion', 'Calling deletion triggers on secure servers...')}</Text>
          </View>
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
  warningCard: {
    borderColor: COLORS.error,
    backgroundColor: '#FFF2F2',
  },
  warningIcon: {
    marginBottom: SPACING.sm,
  },
  warningTitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.error,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  bodyText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    lineHeight: 16,
    marginBottom: SPACING.md,
  },
  bodyTextSmall: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    lineHeight: 14,
    marginTop: SPACING.md,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  bulletIcon: {
    marginRight: SPACING.sm,
    marginTop: 1,
  },
  bulletText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    lineHeight: 14,
    flex: 1,
  },
  input: {
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingHorizontal: SPACING.md,
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.error,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.md,
    textAlign: 'center',
    fontWeight: '700',
  },
  deleteBtn: {
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
});
