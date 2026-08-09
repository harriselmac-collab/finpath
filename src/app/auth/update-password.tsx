import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { parseRecoveryTokens } from '../../services/auth/recovery';
import { isSupabaseConfigured, supabase } from '../../services/supabase/supabaseClient';

export default function UpdatePasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const recoveryUrl = Linking.useLinkingURL();
  const [ready, setReady] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const prepareSession = async () => {
      if (!isSupabaseConfigured) {
        if (!cancelled) {
          setError(t('auth.serviceUnavailable'));
          setReady(true);
        }
        return;
      }
      if (recoveryUrl) {
        const { accessToken, refreshToken } = parseRecoveryTokens(recoveryUrl);
        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError && !cancelled) setError(t('auth.resetLinkInvalid', 'This reset link is invalid or has expired. Request a new one.'));
        }
      }
      const { data } = await supabase.auth.getSession();
      if (!cancelled) {
        const hasRecoverySession = Boolean(data.session);
        setSessionReady(hasRecoverySession);
        if (!hasRecoverySession) setError(t('auth.resetLinkInvalid', 'This reset link is invalid or has expired. Request a new one.'));
        setReady(true);
      }
    };
    void prepareSession();
    return () => { cancelled = true; };
  }, [recoveryUrl, t]);

  const updatePassword = async () => {
    if (!sessionReady) {
      setError(t('auth.resetLinkInvalid', 'This reset link is invalid or has expired. Request a new one.'));
      return;
    }
    if (password.length < 8) {
      setError(t('auth.passwordTooShort', 'Use at least 8 characters.'));
      return;
    }
    if (password !== confirmation) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    setLoading(true);
    setError('');
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(t('auth.passwordUpdateFailed', 'Your password could not be updated. Request a new reset link and try again.'));
      return;
    }
    router.replace('/dashboard');
  };

  if (!ready) {
    return <View style={styles.loading}><ActivityIndicator color={COLORS.primary} /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/auth')} accessibilityRole="button" accessibilityLabel={t('common.back', 'Back')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{t('auth.updatePasswordTitle', 'Choose a new password')}</Text>
        <Text style={styles.subtitle}>{t('auth.updatePasswordSubtitle', 'Use a unique password you do not use for another account.')}</Text>
        <Input label={t('auth.password')} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
        <Input label={t('auth.confirmPassword')} value={confirmation} onChangeText={setConfirmation} secureTextEntry autoCapitalize="none" />
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Button
          title={t('auth.updatePasswordAction', 'Update password')}
          onPress={() => void updatePassword()}
          loading={loading}
          disabled={!sessionReady || loading || password.length < 8 || confirmation.length < 8}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface },
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { height: 56, justifyContent: 'center', paddingHorizontal: SPACING.md },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', padding: SPACING.lg, gap: SPACING.md },
  title: { ...TYPOGRAPHY.displayLgMobile, color: COLORS.primary },
  subtitle: { ...TYPOGRAPHY.bodyMedium, color: COLORS.textSecondary, marginBottom: SPACING.md },
  error: { ...TYPOGRAPHY.bodyMedium, color: COLORS.error },
});
