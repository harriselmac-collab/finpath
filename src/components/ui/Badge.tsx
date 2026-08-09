import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import AppText from '../Text/AppText';

export interface BadgeProps {
  label: string;
  type?: 'essential' | 'important' | 'optional' | 'success' | 'warning' | 'error' | 'default';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, type = 'default', style }) => {
  const getBadgeStyles = () => {
    switch (type) {
      case 'essential':
      case 'success':
        return {
          bg: COLORS.mintBackground,
          border: COLORS.emerald,
          text: COLORS.darkEmerald,
          icon: 'shield-checkmark-outline',
        };
      case 'important':
      case 'warning':
        return {
          bg: COLORS.warningBackground,
          border: COLORS.warning,
          text: COLORS.warning,
          icon: 'alert-circle-outline',
        };
      case 'error':
        return {
          bg: COLORS.errorBackground,
          border: COLORS.error,
          text: COLORS.error,
          icon: 'warning-outline',
        };
      case 'optional':
      default:
        return {
          bg: COLORS.surfaceContainerLow,
          border: COLORS.outlineVariant,
          text: COLORS.textSecondary,
          icon: 'flag-outline',
        };
    }
  };

  const config = getBadgeStyles();

  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.border }, style]}>
      {config.icon && (
        <Ionicons name={config.icon as any} size={11} color={config.text} style={styles.icon} />
      )}
      <AppText variant="labelSm" style={[styles.text, { color: config.text }]}>{label}</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 3,
  },
  text: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
