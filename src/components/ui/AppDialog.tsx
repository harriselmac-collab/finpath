import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import AppText from '../Text/AppText';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

export interface AppDialogAction {
  label: string;
  onPress?: () => void;
  destructive?: boolean;
}

interface AppDialogProps {
  visible: boolean;
  title: string;
  message: string;
  actions: AppDialogAction[];
  onRequestClose: () => void;
}

export function AppDialog({
  visible,
  title,
  message,
  actions,
  onRequestClose,
}: AppDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onRequestClose} accessible={false} />
        <View
          style={styles.dialog}
          accessibilityRole="alert"
          accessibilityViewIsModal
        >
          <AppText variant="h3" style={styles.title} role="heading" aria-level={2}>
            {title}
          </AppText>
          <AppText variant="bodyMedium" style={styles.message}>
            {message}
          </AppText>
          <View style={styles.actions}>
            {actions.map((action, index) => {
              const emphasized = actions.length === 1 || index === actions.length - 1;
              return (
                <Pressable
                  key={`${action.label}-${index}`}
                  style={[
                    styles.action,
                    emphasized && styles.emphasizedAction,
                    action.destructive && styles.destructiveAction,
                  ]}
                  onPress={() => {
                    onRequestClose();
                    action.onPress?.();
                  }}
                  accessibilityRole="button"
                >
                  <AppText
                    variant="button"
                    style={[
                      styles.actionText,
                      emphasized && styles.emphasizedActionText,
                      action.destructive && styles.destructiveActionText,
                    ]}
                  >
                    {action.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    backgroundColor: 'rgba(8, 15, 22, 0.62)',
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  title: {
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  message: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: SPACING.xs,
  },
  action: {
    minWidth: 112,
    minHeight: 44,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
  },
  emphasizedAction: {
    backgroundColor: COLORS.action,
  },
  destructiveAction: {
    backgroundColor: COLORS.error,
  },
  actionText: {
    color: COLORS.textPrimary,
  },
  emphasizedActionText: {
    color: COLORS.onAction,
  },
  destructiveActionText: {
    color: COLORS.onError,
  },
});
