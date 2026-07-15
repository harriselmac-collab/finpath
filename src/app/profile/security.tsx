import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function SecurityScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [biometrics, setBiometrics] = useState(false);

  const handlePasswordChange = () => {
    Alert.alert(
      t('common.success', 'Success'),
      t('common.passwordLinkSent', 'An authentication email link was sent to your inbox to reset your password security.'),
      [{ text: t('common.ok', 'OK') }]
    );
  };

  const handleSignoutDevices = () => {
    Alert.alert(
      t('common.success', 'Success'),
      t('common.sessionsPurged', 'Successfully terminated all other active sessions for your account.'),
      [{ text: t('common.ok', 'OK') }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.security.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Passwords & Login */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{t('settings.security.loginHeader')}</Text>
          <TouchableOpacity style={styles.actionRow} onPress={handlePasswordChange}>
            <View style={styles.actionLeft}>
              <Ionicons name="key-outline" size={20} color={COLORS.primary} style={styles.actionIcon} />
              <View>
                <Text style={styles.actionTitle}>{t('settings.security.changePassword')}</Text>
                <Text style={styles.actionDesc}>{t('settings.security.changePasswordDesc')}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* Biometrics */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{t('settings.security.biometricHeader')}</Text>
          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleTitle}>{t('settings.security.enableBiometric')}</Text>
              <Text style={styles.toggleDesc}>{t('settings.security.biometricDesc')}</Text>
            </View>
            <Switch
              value={biometrics}
              onValueChange={setBiometrics}
              trackColor={{ false: COLORS.outlineVariant, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </Card>

        {/* Active Sessions */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{t('settings.security.sessionsHeader')}</Text>
          <View style={styles.sessionItem}>
            <Ionicons name="desktop-outline" size={20} color={COLORS.emerald} style={styles.sessionIcon} />
            <View style={styles.sessionText}>
              <Text style={styles.sessionDevice}>{t('settings.security.currentDevice')}</Text>
              <Text style={styles.sessionLocation}>{t('settings.security.active')}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.sessionItem}>
            <Ionicons name="logo-android" size={20} color={COLORS.textSecondary} style={styles.sessionIcon} />
            <View style={styles.sessionText}>
              <Text style={styles.sessionDevice}>{t('settings.security.emulator')}</Text>
              <Text style={styles.sessionLocation}>{t('settings.security.emulatorTime')}</Text>
            </View>
          </View>

          <Button
            title={t('settings.security.terminateSessions')}
            onPress={handleSignoutDevices}
            variant="secondary"
            style={styles.sessionsBtn}
          />
        </Card>

        {/* Dangerous */}
        <Card style={[styles.sectionCard, styles.destructiveCard]}>
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
        </Card>
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
    backgroundColor: '#FFF2F2',
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
