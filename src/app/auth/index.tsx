import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function AuthScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    router.replace('/onboarding/welcome');
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

            {error && !email && !password && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Button
              title={isSignUp ? t('auth.signUp') : t('auth.signIn')}
              onPress={handleAuth}
              variant="primary"
              style={styles.authButton}
            />

            <Button
              title={isSignUp ? t('auth.haveAccount') : t('auth.needAccount')}
              onPress={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              variant="text"
              style={styles.toggleButton}
            />

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.orText}>{t('auth.or')}</Text>
              <View style={styles.line} />
            </View>

            <Button
              title={t('auth.mockLogin')}
              onPress={() => router.replace('/onboarding/welcome')}
              variant="secondary"
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
});
