import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { cancelBillReminder, ensureNotificationPermission, rescheduleBillReminder } from '../../services/notifications/billReminders';
import { syncDebtReminders, syncGoalReminders, syncMonthlyReviewReminder } from '../../services/notifications/preferenceReminders';
import { NotificationPreferences, useNotificationPreferencesStore } from '../../store/notificationPreferencesStore';
import { useBillsStore } from '../../store/billsStore';
import { useGoalsStore } from '../../store/goalsStore';
import { useOnboardingStore } from '../../store/onboardingStore';

export default function NotificationsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const preferences = useNotificationPreferencesStore();
  const { updatePreference } = preferences;

  const handleSave = async () => {
    const anyEnabled = preferences.bills || preferences.debts || preferences.goals || preferences.monthlyReview;
    if (anyEnabled && !(await ensureNotificationPermission())) {
      Alert.alert(t('common.error', 'Error'), t('settings.notifications.permissionDenied', 'Notifications are disabled in your device settings. Your preferences were saved, but reminders cannot be delivered.'));
      return;
    }
    try {
      const billState = useBillsStore.getState();
      for (const bill of billState.bills) {
        if (!preferences.bills) {
          await cancelBillReminder(bill.notificationId);
          billState.setNotificationId(bill.id, undefined);
        } else {
          const id = await rescheduleBillReminder(bill, {
            title: t('bills.reminderTitle', 'Upcoming bill'),
            body: t('bills.reminderBody', '{{title}} is due soon.', { title: bill.title }),
          });
          billState.setNotificationId(bill.id, id || undefined);
        }
      }
      await syncDebtReminders(useOnboardingStore.getState().debts, preferences.debts, (debt) => ({
        title: t('notifications.debtTitle', 'Debt payment due'),
        body: t('notifications.debtBody', '{{type}} payment is due soon.', { type: debt.type }),
      }));
      await syncGoalReminders(useGoalsStore.getState().goals, preferences.goals, (goal) => ({
        title: t('notifications.goalTitle', 'Goal deadline approaching'),
        body: t('notifications.goalBody', '{{name}} is due soon.', { name: goal.name }),
      }));
      await syncMonthlyReviewReminder(
        preferences.monthlyReview,
        t('notifications.monthlyTitle', 'Monthly budget review'),
        t('notifications.monthlyBody', 'Review planned and actual spending for the new month.'),
      );
    } catch {
      Alert.alert(t('common.error', 'Error'), t('settings.notifications.scheduleFailed', 'Preferences were saved, but one or more reminders could not be scheduled.'));
      return;
    }
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
        trackColor={{ false: COLORS.outlineVariant, true: COLORS.secondary }}
        thumbColor={COLORS.white}
      />
    </View>
  );

  const setPreference = (key: keyof NotificationPreferences) => (value: boolean) => updatePreference(key, value);

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
        {/* Financial Alerts */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{t('settings.notifications.financialHeader')}</Text>
          {renderToggle(
            t('settings.notifications.billsTitle'),
            t('settings.notifications.billsDesc'),
            preferences.bills,
            setPreference('bills')
          )}
          <View style={styles.divider} />
          {renderToggle(
            t('settings.notifications.debtsTitle'),
            t('settings.notifications.debtsDesc'),
            preferences.debts,
            setPreference('debts')
          )}
          <View style={styles.divider} />
          {renderToggle(
            t('settings.notifications.goalsTitle'),
            t('settings.notifications.goalsDesc'),
            preferences.goals,
            setPreference('goals')
          )}
        </Card>

        {/* Monthly review reminder */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{t('settings.notifications.reportsHeader')}</Text>
          {renderToggle(
            t('settings.notifications.monthlyTitle'),
            t('settings.notifications.monthlyDesc'),
            preferences.monthlyReview,
            setPreference('monthlyReview')
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
