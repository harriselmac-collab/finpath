import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useOnboardingStore } from '../../store/onboardingStore';
import { BillRecurrence, useBillsStore } from '../../store/billsStore';
import { cancelBillReminder, scheduleBillReminder } from '../../services/notifications/billReminders';
import { useNotificationPreferencesStore } from '../../store/notificationPreferencesStore';
import { formatCurrency } from '../../utils/currency';
import { isValidIsoDate, parseFinancialAmount } from '../../utils/financialValidation';

const recurrences: BillRecurrence[] = ['monthly', 'weekly', 'yearly', 'once'];

export default function BillsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const currency = useOnboardingStore((state) => state.answers.currency || 'MAD');
  const billsEnabled = useNotificationPreferencesStore((state) => state.bills);
  const { bills, addBill, deleteBill, markBillPaid, setNotificationId } = useBillsStore();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [recurrence, setRecurrence] = useState<BillRecurrence>('monthly');
  const [error, setError] = useState('');

  const handleAdd = async () => {
    const parsedAmount = parseFinancialAmount(amount, currency);
    if (parsedAmount === null || parsedAmount <= 0 || !isValidIsoDate(dueDate)) {
      setError(t('bills.invalid', 'Enter a name, a positive amount, and a due date in YYYY-MM-DD format.'));
      return;
    }
    const id = addBill({
      title,
      amount: parsedAmount,
      category: 'bill',
      recurrence,
      nextDueDate: dueDate,
      reminderDaysBefore: 3,
    });
    if (!id) {
      setError(t('bills.invalid', 'Enter a name, a positive amount, and a due date in YYYY-MM-DD format.'));
      return;
    }

    const bill = useBillsStore.getState().bills.find((item) => item.id === id);
    if (bill && billsEnabled) {
      try {
        const notificationId = await scheduleBillReminder(bill, {
          title: t('bills.reminderTitle', 'Upcoming bill'),
          body: t('bills.reminderBody', '{{title}} is due soon.', { title: bill.title }),
        });
        setNotificationId(id, notificationId || undefined);
      } catch {
        Alert.alert(t('common.error', 'Error'), t('bills.reminderFailed', 'The bill was saved, but its reminder could not be scheduled.'));
      }
    }
    setTitle('');
    setAmount('');
    setDueDate('');
    setError('');
  };

  const handleDelete = (id: string) => {
    const bill = bills.find((item) => item.id === id);
    Alert.alert(t('bills.deleteTitle', 'Delete bill?'), t('bills.deleteBody', 'This also cancels its reminder.'), [
      { text: t('common.cancel', 'Cancel'), style: 'cancel' },
      {
        text: t('common.delete', 'Delete'),
        style: 'destructive',
        onPress: async () => {
          try { await cancelBillReminder(bill?.notificationId); } catch {}
          deleteBill(id);
        },
      },
    ]);
  };

  const handlePaid = async (id: string) => {
    const bill = bills.find((item) => item.id === id);
    try { await cancelBillReminder(bill?.notificationId); } catch {}
    markBillPaid(id);
    const nextBill = useBillsStore.getState().bills.find((item) => item.id === id);
    if (nextBill?.isActive && billsEnabled) {
      try {
        const notificationId = await scheduleBillReminder(nextBill, {
          title: t('bills.reminderTitle', 'Upcoming bill'),
          body: t('bills.reminderBody', '{{title}} is due soon.', { title: nextBill.title }),
        });
        setNotificationId(id, notificationId || undefined);
      } catch {}
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('bills.title', 'Recurring Bills')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>{t('bills.add', 'Add recurring bill')}</Text>
          <Input label={t('bills.name', 'Bill name')} value={title} onChangeText={setTitle} />
          <Input label={t('bills.amount', 'Amount')} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" prefix={currency} />
          <Input label={t('bills.dueDate', 'Next due date')} placeholder="YYYY-MM-DD" value={dueDate} onChangeText={setDueDate} error={error || undefined} />
          <Text style={styles.inputLabel}>{t('bills.recurrence', 'Repeats')}</Text>
          <View style={styles.chips}>
            {recurrences.map((item) => (
              <TouchableOpacity key={item} style={[styles.chip, recurrence === item && styles.chipActive]} onPress={() => setRecurrence(item)}>
                <Text style={[styles.chipText, recurrence === item && styles.chipTextActive]}>{t(`bills.${item}`, item)}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button title={t('bills.save', 'Save bill')} onPress={handleAdd} />
        </Card>

        <Text style={styles.sectionTitle}>{t('bills.upcoming', 'Upcoming bills')}</Text>
        {bills.length === 0 ? (
          <Card style={styles.emptyCard}><Text style={styles.emptyText}>{t('bills.empty', 'No recurring bills yet.')}</Text></Card>
        ) : bills.map((bill) => (
          <Card key={bill.id} style={styles.billCard}>
            <View style={styles.billInfo}>
              <Text style={styles.billTitle}>{bill.title}</Text>
              <Text style={styles.billMeta}>{t(`bills.${bill.recurrence}`, bill.recurrence)} · {bill.nextDueDate}</Text>
              <Text style={styles.billMeta}>{bill.notificationId ? t('bills.reminderOn', 'Reminder scheduled') : t('bills.reminderOff', 'No reminder scheduled')}</Text>
            </View>
            <Text style={styles.billAmount}>{formatCurrency(bill.amount, currency, i18n.resolvedLanguage || i18n.language)}</Text>
            <TouchableOpacity accessibilityLabel={t('bills.markPaid', 'Mark paid')} onPress={() => handlePaid(bill.id)} style={styles.deleteButton}>
              <Ionicons name="checkmark-circle-outline" size={21} color={COLORS.secondary} />
            </TouchableOpacity>
            <TouchableOpacity accessibilityLabel={t('common.delete', 'Delete')} onPress={() => handleDelete(bill.id)} style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, height: 56, backgroundColor: COLORS.surfaceContainerLowest, borderBottomWidth: 1, borderBottomColor: COLORS.outlineVariant },
  backBtn: { padding: SPACING.xs },
  headerTitle: { ...TYPOGRAPHY.bodyMd, color: COLORS.primary, fontWeight: '700' },
  scrollContent: { padding: SPACING.md, gap: SPACING.md, paddingBottom: 48 },
  card: { padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.outlineVariant },
  sectionTitle: { ...TYPOGRAPHY.bodyMedium, color: COLORS.textPrimary, fontWeight: '700' },
  inputLabel: { ...TYPOGRAPHY.caption, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.md },
  chip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.round, borderWidth: 1, borderColor: COLORS.outlineVariant },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { ...TYPOGRAPHY.caption, color: COLORS.textPrimary, textTransform: 'capitalize' },
  chipTextActive: { color: COLORS.white },
  emptyCard: { padding: SPACING.lg, alignItems: 'center' },
  emptyText: { ...TYPOGRAPHY.bodyMedium, color: COLORS.textSecondary },
  billCard: { padding: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  billInfo: { flex: 1 },
  billTitle: { ...TYPOGRAPHY.bodyMedium, color: COLORS.textPrimary, fontWeight: '700' },
  billMeta: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 3 },
  billAmount: { ...TYPOGRAPHY.bodySemiBold, color: COLORS.textPrimary },
  deleteButton: { padding: SPACING.xs },
});
