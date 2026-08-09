import React, { useState } from 'react';
import { View, StyleSheet, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { Card } from './Card';
import { Button } from './Button';
import AppText from '../Text/AppText';

export interface PassCardProps {
  title: string;
  subtitle: string;
  details: { label: string; value: string }[];
  type: 'savingsGoal' | 'debtMilestone' | 'emergencyFund';
  onSaveToWallet?: () => void;
  walletUrl?: string;
}

export const PassCard: React.FC<PassCardProps> = ({
  title,
  subtitle,
  details,
  type,
  onSaveToWallet,
  walletUrl,
}) => {
  const [saving, setSaving] = useState(false);

  const getTypeColor = (): string => {
    switch (type) {
      case 'savingsGoal':
        return COLORS.emerald;
      case 'debtMilestone':
        return COLORS.warning;
      case 'emergencyFund':
        return COLORS.secondary;
      default:
        return COLORS.primary;
    }
  };

  const getTypeIcon = (): string => {
    switch (type) {
      case 'savingsGoal':
        return 'trophy-outline';
      case 'debtMilestone':
        return 'checkmark-circle-outline';
      case 'emergencyFund':
        return 'shield-checkmark-outline';
      default:
        return 'card-outline';
    }
  };

  const handleSaveToWallet = async () => {
    if (!walletUrl) {
      Alert.alert('Not Ready', 'Wallet save URL is not configured yet.');
      return;
    }

    setSaving(true);
    try {
      const supported = await Linking.canOpenURL(walletUrl);
      if (supported) {
        await Linking.openURL(walletUrl);
        onSaveToWallet?.();
      } else {
        Alert.alert('Error', 'Cannot open Google Wallet on this device.');
      }
    } catch {
      Alert.alert('Error', 'Failed to open wallet save link.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: `${getTypeColor()}20` }]}>
          <Ionicons name={getTypeIcon() as any} size={24} color={getTypeColor()} />
        </View>
        <View style={styles.headerText}>
          <AppText variant="h3" style={styles.title}>{title}</AppText>
          <AppText variant="caption" style={styles.subtitle}>{subtitle}</AppText>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        {details.map((detail, index) => (
          <View key={index} style={styles.detailRow}>
            <AppText variant="bodyMedium" style={styles.detailLabel}>{detail.label}</AppText>
            <AppText variant="bodySemiBold" style={styles.detailValue}>{detail.value}</AppText>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <Button
        title={saving ? 'Opening...' : 'Save to Google Wallet'}
        onPress={handleSaveToWallet}
        variant="secondary"
        disabled={saving}
        style={styles.walletButton}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  detailsContainer: {
    gap: SPACING.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  detailLabel: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
  },
  detailValue: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  walletButton: {
    marginTop: SPACING.xs,
  },
});
