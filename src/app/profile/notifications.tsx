import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function NotificationsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  // Notification states
  const [bills, setBills] = useState(true);
  const [debts, setDebts] = useState(true);
  const [savings, setSavings] = useState(true);
  const [goals, setGoals] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [monthlyReview, setMonthlyReview] = useState(false);
  const [culturalEvents, setCulturalEvents] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // Security alerts is essential (always true)
  const securityAlerts = true;

  const handleSave = () => {
    Alert.alert(t('common.success', 'Success'), t('common.saved', 'Notification preferences saved successfully.'), [
      { text: t('common.ok', 'OK'), onPress: () => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile') }
    ]);
  };

  const renderToggle = (
    title: string,
    description: string,
    value: boolean,
    onValueChange: (val: boolean) => void,
    disabled = false
  ) => (
    <View style={styles.toggleRow}>
      <View style={styles.toggleText}>
        <Text style={[styles.toggleTitle, disabled && styles.disabledText]}>{title}</Text>
        <Text style={styles.toggleDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: COLORS.outlineVariant, true: COLORS.primary }}
        thumbColor={COLORS.white}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.notifications.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Essential Alerts */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{t('settings.notifications.securityHeader')}</Text>
          {renderToggle(
            t('settings.notifications.securityTitle'),
            t('settings.notifications.securityDesc'),
            securityAlerts,
            () => {},
            true
          )}
        </Card>

        {/* Financial Alerts */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{t('settings.notifications.financialHeader')}</Text>
          {renderToggle(
            t('settings.notifications.billsTitle'),
            t('settings.notifications.billsDesc'),
            bills,
            setBills
          )}
          <View style={styles.divider} />
          {renderToggle(
            t('settings.notifications.debtsTitle'),
            t('settings.notifications.debtsDesc'),
            debts,
            setDebts
          )}
          <View style={styles.divider} />
          {renderToggle(
            t('settings.notifications.savingsTitle'),
            t('settings.notifications.savingsDesc'),
            savings,
            setSavings
          )}
          <View style={styles.divider} />
          {renderToggle(
            t('settings.notifications.goalsTitle'),
            t('settings.notifications.goalsDesc'),
            goals,
            setGoals
          )}
        </Card>

        {/* Summaries & Reviews */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{t('settings.notifications.reportsHeader')}</Text>
          {renderToggle(
            t('settings.notifications.weeklyTitle'),
            t('settings.notifications.weeklyDesc'),
            weeklySummary,
            setWeeklySummary
          )}
          <View style={styles.divider} />
          {renderToggle(
            t('settings.notifications.monthlyTitle'),
            t('settings.notifications.monthlyDesc'),
            monthlyReview,
            setMonthlyReview
          )}
        </Card>

        {/* Cultural & Religious Preferences */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{t('settings.notifications.culturalHeader')}</Text>
          {renderToggle(
            t('settings.notifications.culturalTitle'),
            t('settings.notifications.culturalDesc'),
            culturalEvents,
            setCulturalEvents
          )}
        </Card>

        {/* Marketing Preferences */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{t('settings.notifications.marketingHeader')}</Text>
          {renderToggle(
            t('settings.notifications.productTitle'),
            t('settings.notifications.productDesc'),
            productUpdates,
            setProductUpdates
          )}
          <View style={styles.divider} />
          {renderToggle(
            t('settings.notifications.marketingTitle'),
            t('settings.notifications.marketingDesc'),
            marketing,
            setMarketing
          )}
        </Card>

        <Button title={t('settings.notifications.save')} onPress={handleSave} style={styles.saveBtn} />
        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    height: 56,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.primary,
    fontWeight: '700',
  },
  scrollContent: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  sectionCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  sectionHeader: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  toggleText: {
    flex: 1,
    marginRight: SPACING.md,
  },
  toggleTitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  toggleDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 14,
  },
  disabledText: {
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
    marginVertical: SPACING.sm,
  },
  saveBtn: {
    width: '100%',
    marginTop: SPACING.sm,
  },
});
