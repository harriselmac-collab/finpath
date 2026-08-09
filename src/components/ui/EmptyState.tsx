import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { Button } from './Button';
import AppText from '../Text/AppText';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'document-outline',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={48} color={COLORS.textSecondary} />
      </View>
      <AppText variant="headlineMd" style={styles.title}>{title}</AppText>
      {description && <AppText variant="bodyMedium" style={styles.description}>{description}</AppText>}
      
      <View style={styles.actions}>
        {actionLabel && onAction && (
          <Button
            title={actionLabel}
            onPress={onAction}
            variant="primary"
            style={styles.actionButton}
          />
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button
            title={secondaryActionLabel}
            onPress={onSecondaryAction}
            variant="secondary"
            style={styles.secondaryButton}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  description: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  actions: {
    gap: SPACING.sm,
    width: '100%',
    maxWidth: 280,
  },
  actionButton: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
  },
});
