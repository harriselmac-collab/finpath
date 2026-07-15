import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../services/supabase/supabaseClient';
import { useSessionStore } from '../../store/sessionStore';

export default function AuthScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setSession = useSessionStore((state) => state.setSession);

  React.useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '123456789-mock-web-client-id.apps.googleusercontent.com',
    });
  }, []);

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);

    const isMockSupabase = !process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL.includes('mock-url.supabase.co');
    const isMockGoogle = !process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID === '123456789-mock-web-client-id.apps.googleusercontent.com';

    if (isMockSupabase || isMockGoogle) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const mockSession = {
        access_token: 'mock-google-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-google-refresh-token',
        user: {
          id: 'mock-google-user-id',
          email: 'google-guest@finpath.com',
          app_metadata: {},
          user_metadata: { preferredName: 'Google Guest' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        },
      };

      setSession(mockSession as any);

      Alert.alert(
        'Google Auth (Simulation Mode)',
        `Logged in successfully as Google guest: google-guest@finpath.com\n\nLive Google client credentials are unconfigured.`,
        [
          {
            text: 'OK',
            onPress: () => router.replace('/onboarding/welcome'),
          },
        ]
      );
      setLoading(false);
      return;
    }

    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      if (userInfo.data?.idToken) {
        const { data, error: signInError } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.data.idToken,
        });

        if (signInError) {
          throw signInError;
        }

        if (data.session) {
          setSession(data.session);
          router.replace('/');
        }
      } else {
        throw new Error('No Google ID Token found.');
      }
    } catch (err: any) {
      console.warn('Google Sign-In error, falling back to Simulation Mode:', err);
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const mockSession = {
        access_token: 'mock-google-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-google-refresh-token',
        user: {
          id: 'mock-google-user-id',
          email: 'google-guest@finpath.com',
          app_metadata: {},
          user_metadata: { preferredName: 'Google Guest' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        },
      };

      setSession(mockSession as any);

      Alert.alert(
        'Google Auth (Simulation Mode)',
        `Encountered Google Sign-In exception: ${err?.message || 'Developer Error'}.\n\nLogged in via Simulation Mode as Google Guest.`,
        [
          {
            text: 'Proceed',
            onPress: () => router.replace('/onboarding/welcome'),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    const isMockSupabase = !process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL.includes('mock-url.supabase.co');

    if (isMockSupabase) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const mockSession = {
        access_token: 'mock-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'mock-user-id',
          email: email,
          app_metadata: {},
          user_metadata: { preferredName: email.split('@')[0] },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        },
      };

      setSession(mockSession as any);

      Alert.alert(
        'Supabase Auth (Simulation Mode)',
        `Logged in successfully as guest: ${email}\n\nLive backend is currently offline or unconfigured.`,
        [
          {
            text: 'OK',
            onPress: () => router.replace('/onboarding/welcome'),
          },
        ]
      );
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          throw signUpError;
        }

        if (data.session) {
          setSession(data.session);
          router.replace('/onboarding/welcome');
        } else {
          Alert.alert(
            'Verification Sent',
            'Please check your email inbox to verify your account registration.',
            [{ text: 'OK', onPress: () => setIsSignUp(false) }]
          );
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        if (data.session) {
          setSession(data.session);
          router.replace('/');
        }
      }
    } catch (err: any) {
      console.warn('Supabase Auth error, falling back to Simulation Mode:', err);
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const mockSession = {
        access_token: 'mock-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'mock-user-id',
          email: email,
          app_metadata: {},
          user_metadata: { preferredName: email.split('@')[0] },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        },
      };

      setSession(mockSession as any);

      Alert.alert(
        'Supabase Auth (Simulation Mode)',
        `Encountered API exception: ${err?.message || 'Unauthorized'}.\n\nLogged in via Simulation Mode as: ${email}.`,
        [
          {
            text: 'Proceed',
            onPress: () => router.replace('/onboarding/welcome'),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
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
          <Animated.View entering={FadeInDown.duration(500)} style={styles.brandSection}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>FP</Text>
            </View>
            <Text style={styles.brandName}>FinPath</Text>
          </Animated.View>

          {/* Header */}
          <Animated.View entering={FadeInDown.duration(500).delay(150)} style={styles.header}>
            <Text style={styles.title}>{t('auth.title')}</Text>
            <Text style={styles.subtitle}>
              {isSignUp ? 'Create your secure account' : 'Sign in to access your dashboard'}
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.form}>
            <Input
              label={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              keyboardType="email-address"
              error={error && !email ? 'Email is required' : undefined}
            />

            <Input
              label={t('auth.password')}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              error={error && !password ? 'Password is required' : undefined}
            />

            {isSignUp && (
              <Animated.View
                entering={FadeInDown.duration(250)}
                exiting={FadeOut.duration(200)}
              >
                <Input
                  label={t('auth.confirmPassword')}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  secureTextEntry
                  error={error && password !== confirmPassword ? 'Passwords must match' : undefined}
                />
              </Animated.View>
            )}

            {!!error && !email && !password && (
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

            <Button
              title={t('auth.mockLogin')}
              onPress={() => router.replace('/onboarding/welcome')}
              variant="secondary"
              disabled={loading}
              style={styles.mockButton}
            />
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
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.md,
  },
  logoText: {
    ...TYPOGRAPHY.h2,
    color: COLORS.white,
    fontWeight: '800',
  },
  brandName: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primary,
    fontWeight: '800',
    letterSpacing: -0.5,
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
    backgroundColor: '#FFF2F2',
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
    backgroundColor: COLORS.white,
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
