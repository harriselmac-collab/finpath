import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { isSupabaseConfigured, supabase } from '../../services/supabase/supabaseClient';
import { useSessionStore } from '../../store/sessionStore';
import { useSecurityStore } from '../../store/securityStore';

export default function SecurityScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const user = useSessionStore((state) => state.user);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const isBiometricsEnabled = useSecurityStore((state) => state.isBiometricsEnabled);
  const biometryType = useSecurityStore((state) => state.biometryType);
  const checkBiometricsSupport = useSecurityStore((state) => state.checkBiometricsSupport);
  const setBiometricsEnabled = useSecurityStore((state) => state.setBiometricsEnabled);

  useEffect(() => {
    void checkBiometricsSupport();
  }, [checkBiometricsSupport]);

  const handleToggleBiometrics = async (value: boolean) => {
    const success = await setBiometricsEnabled(value);
    if (!success && value) {
      Alert.alert(
        t('common.error', 'Error'),
        t('settings.security.biometricsFailed', 'Biometrics could not be enabled. Please ensure your device has biometrics configured.'),
      );
    }
  };

  const handlePasswordChange = async () => {
    if (!isSupabaseConfigured || !user?.email) {
      Alert.alert(t('common.signInRequired', 'Sign in required'), t('settings.security.signInRequired', 'Sign in to manage account security.'));
      return;
    }
    setPasswordLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: Linking.createURL('auth/update-password'),
    });
    setPasswordLoading(false);
    Alert.alert(
      error ? t('common.error', 'Error') : t('common.success', 'Success'),
      error
        ? t('settings.security.passwordLinkFailed', 'We could not send the password reset email. Please try again shortly.')
        : t('common.passwordLinkSent', 'A secure password reset link was sent to your email address.'),
      [{ text: t('common.ok', 'OK') }],
    );
  };

  const handleSignoutDevices = () => {
    Alert.alert(
      t('settings.security.terminateSessions', 'Sign out other devices'),
      t('settings.security.terminateConfirmation', 'This will sign out every other Pocket Ahead session. This device will remain signed in.'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.continue', 'Continue'),
          style: 'destructive',
          onPress: async () => {
            if (!user || !isSupabaseConfigured) {
              Alert.alert(t('common.signInRequired', 'Sign in required'), t('settings.security.signInRequired', 'Sign in to manage account security.'));
              return;
            }
            setSessionsLoading(true);
            const { error } = await supabase.auth.signOut({ scope: 'others' });
            setSessionsLoading(false);
            Alert.alert(
              error ? t('common.error', 'Error') : t('common.success', 'Success'),
              error
                ? t('settings.security.sessionsPurgeFailed', 'Other sessions could not be signed out. Please try again.')
                : t('common.sessionsPurged', 'All other active sessions were signed out.'),
            );
          },
        },
      ],
    );
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
        <Text style={styles.headerTitle}>{t('settings.security.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Biometric App Lock */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{t('settings.security.biometricsHeader', 'App Lock')}</Text>
          <View style={styles.actionRow}>
            <View style={styles.actionLeft}>
              <Ionicons
                name={biometryType === 'Face ID' ? 'scan-outline' : 'finger-print-outline'}
                size={22}
                color={COLORS.primary}
                style={styles.actionIcon}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>
                  {t('settings.security.biometricsTitle', { type: biometryType, defaultValue: `Require ${biometryType}` })}
                </Text>
                <Text style={styles.actionDesc}>
                  {t('settings.security.biometricsDesc', 'Protect your financial plan and transactions when switching apps.')}
                </Text>
              </View>
            </View>
            <Switch
              value={isBiometricsEnabled}
              onValueChange={handleToggleBiometrics}
              trackColor={{ false: COLORS.outlineVariant, true: COLORS.primary }}
              thumbColor={COLORS.surfaceContainerLowest}
            />
          </View>
        </Card>

        {!user && (
          <Card style={styles.sectionCard}>
            <Text style={styles.actionTitle}>{t('common.signInRequired', 'Sign in required')}</Text>
            <Text style={styles.actionDesc}>{t('settings.security.signInRequired', 'Sign in to manage password and session security.')}</Text>
            <Button title={t('auth.signIn', 'Sign in')} onPress={() => router.push('/auth')} style={styles.sessionsBtn} />
          </Card>
        )}

        {/* Passwords & Login */}
        {user && <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{t('settings.security.loginHeader')}</Text>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => void handlePasswordChange()}
            disabled={passwordLoading}
            accessibilityRole="button"
            accessibilityLabel={t('settings.security.passwordAction')}
            accessibilityState={{ disabled: passwordLoading }}
          >
            <View style={styles.actionLeft}>
              <Ionicons name="key-outline" size={20} color={COLORS.primary} style={styles.actionIcon} />
              <View>
                <Text style={styles.actionTitle}>{t('settings.security.changePassword')}</Text>
                <Text style={styles.actionDesc}>{t('settings.security.changePasswordDesc')}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </Card>}

        {/* Active Sessions */}
        {user && <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{t('settings.security.sessionsHeader')}</Text>
          <View style={styles.sessionItem}>
            <Ionicons name="desktop-outline" size={20} color={COLORS.emerald} style={styles.sessionIcon} />
            <View style={styles.sessionText}>
              <Text style={styles.sessionDevice}>{t('settings.security.currentDevice')}</Text>
              <Text style={styles.sessionLocation}>{t('settings.security.active')}</Text>
            </View>
          </View>
          <Button
            title={t('settings.security.terminateSessions')}
            onPress={handleSignoutDevices}
            variant="secondary"
            loading={sessionsLoading}
            disabled={sessionsLoading}
            style={styles.sessionsBtn}
          />
        </Card>}

        {/* Dangerous */}
        {user && <Card style={[styles.sectionCard, styles.destructiveCard]}>
          <Text style={styles.destructiveTitle}>{t('settings.security.purgeHeader')}</Text>
          <Text style={styles.destructiveDesc}>
            {t('settings.security.purgeDesc')}
          </Text>
          <Button
            title={t('settings.security.deleteBtn')}
            onPress={() => router.push('/profile/delete-account')}
            variant="destructive"
            style={styles.deleteBtn}
          />
        </Card>}
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
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  actionIcon: {
    marginRight: 4,
  },
  actionTitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  sessionIcon: {
    marginRight: SPACING.md,
  },
  sessionText: {
    flex: 1,
  },
  sessionDevice: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  sessionLocation: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
    marginVertical: SPACING.xs,
  },
  sessionsBtn: {
    marginTop: SPACING.md,
    width: '100%',
  },
  destructiveCard: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorBackground,
  },
  destructiveTitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.error,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  destructiveDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    lineHeight: 16,
    marginBottom: SPACING.md,
  },
  deleteBtn: {
    width: '100%',
  },
});
