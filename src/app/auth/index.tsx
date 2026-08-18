import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Animated, { Easing, FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  isAuthSimulationEnabled,
  isSupabaseConfigured,
  supabase,
} from '../../services/supabase/supabaseClient';
import { useSessionStore } from '../../store/sessionStore';
import { createMockSession, MOCK_SESSION_DELAY } from '../../mocks/supabaseMock';
import { captureLocalFinancialData, hasLocalFinancialData, migrateLocalDataToAccount } from '../../services/sync/guestMigration';
import { parseAuthCallback } from '../../services/auth/recovery';

const userFacingAuthError = (error: any, t: (key: string, options?: any) => string) => {
  const code = String(error?.code || error?.status || '');
  const message = error?.message || '';

  if (
    code === '12501' ||
    code === statusCodes?.SIGN_IN_CANCELLED ||
    code === 'SIGN_IN_CANCELLED' ||
    message.toLowerCase().includes('cancel')
  ) {
    return '';
  }

  if (code === '10' || code === 'DEVELOPER_ERROR' || message.includes('DEVELOPER_ERROR')) {
    return t('auth.googleDeveloperError', {
      defaultValue: 'Google Sign-In configuration issue. Ensure your Android SHA-1 fingerprint is registered in Google Cloud Console and Supabase.',
    });
  }

  if (code === '2' || code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE || code === 'PLAY_SERVICES_NOT_AVAILABLE') {
    return t('auth.googlePlayServicesError', {
      defaultValue: 'Google Play Services is not available or outdated on this device.',
    });
  }

  switch (code) {
    case 'invalid_credentials':
      return t('auth.invalidCredentials', { defaultValue: 'The email or password is incorrect.' });
    case 'email_not_confirmed':
      return t('auth.emailNotConfirmed', { defaultValue: 'Confirm your email address before signing in (or disable "Confirm email" in Supabase).' });
    case 'user_already_exists':
    case 'email_exists':
      return t('auth.accountExists', { defaultValue: 'An account already exists for this email address.' });
    case 'weak_password':
      return t('auth.weakPassword', { defaultValue: 'Choose a stronger password with at least 8 characters.' });
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return t('auth.rateLimited', { defaultValue: 'Too many attempts. Wait a moment and try again.' });
    default:
      return message || t('auth.signInFailed', { defaultValue: 'Sign-in failed. Please check your details and try again.' });
  }
};

const authEnter = (delay = 0) =>
  (Platform.OS === 'web'
    ? FadeIn.duration(200)
    : FadeInDown.duration(200).withInitialValues({
        opacity: 0,
        transform: [{ translateY: 8 }],
      }))
    .delay(delay)
    .easing(Easing.bezier(0.23, 1, 0.32, 1));

export default function AuthScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { t } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setSession = useSessionStore((state) => state.setSession);
  const linkingUrl = Linking.useLinkingURL();
  const callbackUrl = linkingUrl || (typeof window !== 'undefined' ? window.location.href : null);
  const handledCallbackUrl = useRef<string | null>(null);

  const finishAuthentication = useCallback((session: Parameters<typeof setSession>[0], localSnapshot: ReturnType<typeof captureLocalFinancialData>) => {
    if (!session) return;
    setSession(session);
    if (!hasLocalFinancialData(localSnapshot)) {
      router.replace('/');
      return;
    }
    Alert.alert(
      t('auth.localMigrationTitle', 'Use your local Pocket Ahead data?'),
      t('auth.localMigrationMessage', 'Your transactions, bills, goals, preferences, and plan are still stored on this device. Choose what to do before synchronization.'),
      [
        {
          text: t('auth.localMigrationKeep', 'Keep local data and sync it'),
          onPress: async () => {
            const migrated = await migrateLocalDataToAccount(localSnapshot, session.user.id);
            if (!migrated) Alert.alert(t('auth.migrationFailedTitle', 'Sync not completed'), t('auth.migrationFailedMessage', 'Your local data is still safe on this device. Try synchronization again later.'));
            router.replace('/');
          },
        },
        { text: t('auth.localMigrationEmpty', 'Start with an empty account'), onPress: () => router.replace('/') },
        { text: t('common.cancel'), style: 'cancel', onPress: async () => { await useSessionStore.getState().signOut(); router.replace('/'); } },
      ],
    );
  }, [router, setSession, t]);

  React.useEffect(() => {
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    if (webClientId && Platform.OS !== 'web') {
      GoogleSignin.configure({
        webClientId,
        offlineAccess: true,
        scopes: ['profile', 'email'],
      });
    }
  }, []);

  React.useEffect(() => {
    if (!callbackUrl || handledCallbackUrl.current === callbackUrl || !isSupabaseConfigured) return;
    const { accessToken, refreshToken, type, errorCode } = parseAuthCallback(callbackUrl);
    if (type === 'recovery') return;
    if (!errorCode && (!accessToken || !refreshToken)) return;
    handledCallbackUrl.current = callbackUrl;

    const acceptConfirmedSession = async () => {
      if (errorCode || !accessToken || !refreshToken) {
        setError(t('auth.confirmationFailed', 'The confirmation link is invalid or has expired. Request a new email and try again.'));
        return;
      }
      const localSnapshot = captureLocalFinancialData();
      setLoading(true);
      setError('');
      const { data, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      setLoading(false);
      if (sessionError || !data.session) {
        setError(t('auth.confirmationFailed', 'The confirmation link is invalid or has expired. Request a new email and try again.'));
        return;
      }
      finishAuthentication(data.session, localSnapshot);
    };

    void acceptConfirmedSession();
  }, [callbackUrl, finishAuthentication, t]);

  const startSimulation = async () => {
    if (!isAuthSimulationEnabled) return;
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, MOCK_SESSION_DELAY));
    setSession(createMockSession(email || 'development@pocketahead.local') as any);
    setLoading(false);
    Alert.alert(t('auth.simulationTitle'), t('auth.simulationNotice'), [
      { text: t('common.continue'), onPress: () => router.replace('/onboarding/welcome') },
    ]);
  };

  const handleGoogleAuth = async () => {
    const localSnapshot = captureLocalFinancialData();
    setError('');
    setLoading(true);

    if (!isSupabaseConfigured || !process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
      setError(t('auth.serviceUnavailable'));
      setLoading(false);
      return;
    }

    try {
      if (Platform.OS === 'web') {
        const { error: oAuthError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: Linking.createURL('auth'),
          },
        });
        if (oAuthError) throw oAuthError;
        return;
      }

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();

      if ((response as any)?.type === 'cancelled') {
        return;
      }

      const idToken = (response as any)?.data?.idToken || (response as any)?.idToken;

      if (idToken) {
        const { data, error: signInError } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });

        if (signInError) {
          throw signInError;
        }

        if (data.session) {
          finishAuthentication(data.session, localSnapshot);
        }
      } else {
        throw new Error(t('auth.googleTokenMissing', { defaultValue: 'Google did not return a valid sign-in token.' }));
      }
    } catch (err: any) {
      const errorMsg = userFacingAuthError(err, t);
      if (errorMsg) {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    const localSnapshot = captureLocalFinancialData();
    const normalizedEmail = email.trim().toLowerCase();

    setError('');

    if (!normalizedEmail || !password) {
      setError(t('auth.requiredFields'));
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError(t('auth.invalidEmail', 'Enter a valid email address.'));
      return;
    }
    if (isSignUp && password.length < 8) {
      setError(t('auth.passwordTooShort', 'Use at least 8 characters.'));
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    setLoading(true);

    if (!isSupabaseConfigured) {
      setError(t('auth.serviceUnavailable'));
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: { emailRedirectTo: Linking.createURL('auth') },
        });

        if (signUpError) {
          throw signUpError;
        }

        if (data.session) {
          finishAuthentication(data.session, localSnapshot);
        } else {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });

          if (!signInError && signInData.session) {
            finishAuthentication(signInData.session, localSnapshot);
          } else {
            Alert.alert(
              t('auth.verificationTitle', { defaultValue: 'Verification sent' }),
              t('auth.verificationMessage', { defaultValue: 'Check your email to verify your account before signing in, or disable "Confirm email" in Supabase Auth settings to skip verification.' }),
              [
                { text: t('common.continue', { defaultValue: 'Continue' }), onPress: () => setIsSignUp(false) },
              ],
            );
          }
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        if (data.session) {
          finishAuthentication(data.session, localSnapshot);
        }
      }
    } catch (err: any) {
      const errorMsg = userFacingAuthError(err, t);
      if (errorMsg) {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError(t('auth.enterEmailForReset', 'Enter your email address first.'));
      return;
    }
    if (!isSupabaseConfigured) {
      setError(t('auth.serviceUnavailable'));
      return;
    }
    setError('');
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: Linking.createURL('auth/update-password'),
    });
    setLoading(false);
    if (resetError) {
      setError(t('auth.resetEmailFailed', 'The reset email could not be sent. Please wait a moment and try again.'));
      return;
    }
    Alert.alert(
      t('auth.resetEmailTitle', 'Check your email'),
      t('auth.resetEmailMessage', 'If an account exists for that address, Pocket Ahead sent a secure password reset link.'),
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <Animated.View entering={authEnter()} style={styles.brandSection}>
            <Image
              source={require('../../../assets/branding/app-logo.svg')}
              style={styles.brandLogo}
              contentFit="contain"
              accessibilityLabel="Pocket Ahead"
            />
          </Animated.View>

          {/* Header */}
          <Animated.View entering={authEnter(40)} style={styles.header}>
            <Text style={styles.title}>{t('auth.title')}</Text>
            <Text style={styles.subtitle}>
              {isSignUp ? t('auth.signUpSubtitle') : t('auth.signInSubtitle')}
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={authEnter(80)} style={styles.form}>
            <Input
              label={t('auth.email')}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError('');
              }}
              placeholder="name@example.com"
              keyboardType="email-address"
              error={error && !email.trim() ? t('auth.emailRequired') : undefined}
            />

            <Input
              label={t('auth.password')}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) setError('');
              }}
              placeholder="••••••••"
              secureTextEntry
              error={error && !password ? t('auth.passwordRequired') : undefined}
            />

            {!isSignUp && (
              <Button
                title={t('auth.forgotPassword', 'Forgot password?')}
                onPress={() => void handleForgotPassword()}
                variant="text"
                disabled={loading}
                style={styles.forgotButton}
              />
            )}

            {isSignUp && (
              <Animated.View
                entering={FadeInDown.duration(250)}
                exiting={FadeOut.duration(200)}
              >
                <Input
                  label={t('auth.confirmPassword')}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (error) setError('');
                  }}
                  placeholder="••••••••"
                  secureTextEntry
                  error={error && password !== confirmPassword ? t('auth.passwordMismatch') : undefined}
                />
              </Animated.View>
            )}

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Button
              title={isSignUp ? t('auth.signUp') : t('auth.signIn')}
              onPress={handleAuth}
              variant="primary"
              loading={loading}
              disabled={loading}
              style={styles.authButton}
            />

            <Button
              title={isSignUp ? t('auth.haveAccount') : t('auth.needAccount')}
              onPress={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              variant="text"
              disabled={loading}
              style={styles.toggleButton}
            />

            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleAuth}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-google" size={18} color="#EA4335" style={styles.googleIcon} />
              <Text style={styles.googleButtonText}>{t('auth.googleSignIn', 'Continue with Google')}</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.orText}>{t('auth.or')}</Text>
              <View style={styles.line} />
            </View>

            {isAuthSimulationEnabled && (
              <Button
                title={t('auth.simulationButton')}
                onPress={() => void startSimulation()}
                variant="secondary"
                disabled={loading}
                style={styles.mockButton}
              />
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  brandLogo: {
    width: 82,
    height: 94,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.displayLgMobile,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    width: '100%',
  },
  errorBox: {
    backgroundColor: COLORS.errorBackground,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.error,
    fontWeight: '600',
    textAlign: 'center',
  },
  authButton: {
    marginTop: SPACING.sm,
    height: 52,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    minHeight: 40,
    marginTop: -SPACING.xs,
  },
  toggleButton: {
    alignSelf: 'center',
    marginTop: SPACING.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.outlineVariant,
  },
  orText: {
    ...TYPOGRAPHY.caption,
    marginHorizontal: SPACING.md,
    color: COLORS.textSecondary,
  },
  mockButton: {
    marginTop: SPACING.xs,
    height: 48,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    height: 48,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: RADIUS.md,
  },
  googleIcon: {
    marginRight: SPACING.xs,
  },
  googleButtonText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
});
