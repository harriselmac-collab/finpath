import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import AppText from '../Text/AppText';
import { Button, Icon } from '../ui';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useSecurityStore } from '../../store/securityStore';

export function AppLockOverlay() {
  const { t } = useTranslation();
  const isLocked = useSecurityStore((state) => state.isLocked);
  const isBiometricsEnabled = useSecurityStore((state) => state.isBiometricsEnabled);
  const biometryType = useSecurityStore((state) => state.biometryType);
  const authenticate = useSecurityStore((state) => state.authenticate);

  useEffect(() => {
    if (isBiometricsEnabled && isLocked) {
      void authenticate();
    }
  }, [isBiometricsEnabled, isLocked, authenticate]);

  if (!isBiometricsEnabled || !isLocked) {
    return null;
  }

  const iconName = biometryType === 'Face ID' ? 'scan-outline' : 'finger-print-outline';

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={styles.container}
      role="alert"
      accessibilityViewIsModal
    >
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Icon name={iconName} size={48} color={COLORS.primary} />
        </View>

        <AppText variant="sectionTitle" style={styles.title} role="heading" aria-level={1}>
          {t('security.appLocked', 'Pocket Ahead is Locked')}
        </AppText>

        <AppText variant="body" style={styles.subtitle}>
          {t(
            'security.unlockPrompt',
            'Your financial information is protected. Unlock to continue.',
          )}
        </AppText>

        <Button
          title={t('security.unlockWithBiometrics', {
            type: biometryType,
            defaultValue: `Unlock with ${biometryType}`,
          })}
          onPress={() => void authenticate()}
          style={styles.unlockButton}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  content: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  unlockButton: {
    marginTop: SPACING.lg,
    width: '100%',
  },
});
