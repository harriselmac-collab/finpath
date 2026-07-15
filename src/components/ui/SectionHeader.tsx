// src/components/ui/SectionHeader.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import AppText from '../Text/AppText';
import { Icon } from './Icon';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        {icon && (
          <View style={styles.iconContainer}>
            <Icon name={icon} size={20} color={COLORS.primary} />
          </View>
        )}
        <View>
          <AppText variant="sectionTitle" style={styles.title}>
            {title}
          </AppText>
          {subtitle && (
            <AppText variant="supporting" style={styles.subtitle}>
              {subtitle}
            </AppText>
          )}
        </View>
      </View>

      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} style={styles.actionButton}>
          <AppText variant="button" style={styles.actionText}>
            {actionLabel}
          </AppText>
          <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    // We'll let the variant handle the typography, but we need to override the color?
    // The variant already sets the color via typography, but we want to use the theme's textPrimary
    // Actually, the typography doesn't set color; we set it in the style.
    // We'll set the color to textPrimary for title and supporting.
    color: COLORS.textPrimary,
  },
  subtitle: {
    color: COLORS.textSecondary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  actionText: {
    // The variant will set the fontFamily and size, we just need to set the color
    color: COLORS.primary,
  },
});