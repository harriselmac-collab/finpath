import React, { useEffect, useState } from 'react';
import { Alert, BackHandler, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

import AppText from '../components/Text/AppText';
import { Button, Input } from '../components/ui';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useOnboardingStore } from '../store/onboardingStore';
import { useTransactionsStore } from '../store/transactionsStore';
import { parseFinancialAmount } from '../utils/financialValidation';

type TransactionType = 'income' | 'essential' | 'flexible' | 'debt' | 'savings' | 'refund' | 'transfer';
const TYPES: TransactionType[] = ['income', 'essential', 'flexible', 'debt', 'savings', 'refund', 'transfer'];

export default function TransactionFormScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { actionType, transactionId } = useLocalSearchParams<{ actionType?: string; transactionId?: string }>();
  const currency = useOnboardingStore((state) => state.answers.currency || 'MAD');
  const addTransaction = useTransactionsStore((state) => state.addTransaction);
  const updateTransaction = useTransactionsStore((state) => state.updateTransaction);
  const existing = useTransactionsStore((state) => state.transactions.find((item) => item.id === transactionId));
  const initialType = TYPES.includes(actionType as TransactionType) ? actionType as TransactionType : 'flexible';
  const [name, setName] = useState(existing?.name || '');
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [type, setType] = useState<TransactionType>(existing?.type || initialType);
  const [category, setCategory] = useState(existing?.category || (initialType === 'income' ? 'Income' : 'Groceries'));
  const [receiptUri, setReceiptUri] = useState<string | undefined>(existing?.receiptUri);
  const isDirty = Boolean(name.trim() || amount.trim() || category !== (initialType === 'income' ? 'Income' : 'Groceries') || type !== initialType || receiptUri !== existing?.receiptUri);

  const handlePickReceipt = () => {
    Alert.alert(
      t('transactions.attachReceipt', 'Attach Receipt'),
      t('transactions.chooseSource', 'Choose a source for your receipt photo:'),
      [
        {
          text: t('transactions.camera', 'Take Photo'),
          onPress: async () => {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
              Alert.alert(t('common.error', 'Error'), t('transactions.cameraPermissionRequired', 'Camera permission is required to take photos of receipts.'));
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              quality: 0.8,
              allowsEditing: true,
            });
            if (!result.canceled && result.assets?.[0]?.uri) {
              setReceiptUri(result.assets[0].uri);
            }
          },
        },
        {
          text: t('transactions.gallery', 'Choose from Gallery'),
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              quality: 0.8,
              allowsEditing: true,
            });
            if (!result.canceled && result.assets?.[0]?.uri) {
              setReceiptUri(result.assets[0].uri);
            }
          },
        },
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
      ],
    );
  };

  const close = () => {
    if (!isDirty) return router.back();
    Alert.alert(
      t('transactions.discardTitle', 'Discard transaction?'),
      t('transactions.discardMessage', 'Your entered transaction details will be lost.'),
      [
        { text: t('transactions.keepEditing', 'Keep editing'), style: 'cancel' },
        { text: t('transactions.discard', 'Discard'), style: 'destructive', onPress: () => router.back() },
      ],
    );
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      const focusedInput = TextInput.State.currentlyFocusedInput();
      if (Keyboard.isVisible() || focusedInput) {
        focusedInput?.blur();
        Keyboard.dismiss();
        return true;
      }
      close();
      return true;
    });
    return () => subscription.remove();
  });

  const save = () => {
    const parsedAmount = parseFinancialAmount(amount, currency);
    if (!name.trim() || parsedAmount === null || parsedAmount <= 0) {
      Alert.alert(t('common.error', 'Error'), t('transactions.validDetails', 'Enter a name and a positive amount.'));
      return;
    }
    const now = new Date();
    const locale = i18n.resolvedLanguage || i18n.language || 'en';
    const values = {
      name: name.trim(),
      amount: parsedAmount,
      type,
      category: category.trim() || t(`transactions.filters.${type}`, type),
      date: now.toLocaleDateString(locale, { month: 'short', day: 'numeric' }),
      timeGroup: now.toLocaleDateString(locale, { month: 'long' }),
      receiptUri,
    };
    if (existing) updateTransaction(existing.id, values);
    else addTransaction(values);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={close} style={styles.backButton} accessibilityRole="button" accessibilityLabel={t('common.back', 'Back')}>
            <Ionicons name="arrow-back" size={22} color={COLORS.primary} accessible={false} />
          </Pressable>
          <AppText variant="sectionTitle" style={styles.title} role="heading" aria-level={1}>{existing ? t('transactions.editTitle', 'Edit transaction') : t('transactions.addTitle', 'Add Transaction')}</AppText>
          <View style={styles.headerSpacer} />
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Input label={t('transactions.nameLabel', 'Name')} value={name} onChangeText={setName} placeholder={t('transactions.namePlaceholder', 'e.g. Electric bill')} />
          <Input label={`${t('transactions.amountLabel', 'Amount')} (${currency})`} value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" />
          <AppText variant="inputLabel" style={styles.label}>{t('transactions.typeLabel', 'Type')}</AppText>
          <View style={styles.types} accessibilityRole="radiogroup">
            {TYPES.map((item) => (
              <Pressable
                key={item}
                onPress={() => setType(item)}
                style={[styles.typeButton, type === item && styles.typeButtonActive]}
                accessibilityRole="radio"
                accessibilityState={{ checked: type === item }}
              >
                <AppText variant="labelSm" style={[styles.typeText, type === item && styles.typeTextActive]}>{t(`transactions.filters.${item}`, item)}</AppText>
              </Pressable>
            ))}
          </View>
          <Input label={t('transactions.categoryLabel', 'Category')} value={category} onChangeText={setCategory} placeholder={t('transactions.categoryPlaceholder', 'e.g. Utilities or Salary')} />
          
          {/* Receipt Attachment Section */}
          <View style={styles.receiptSection}>
            <AppText variant="inputLabel" style={styles.label}>{t('transactions.receiptLabel', 'Receipt / Bill Photo')}</AppText>
            {receiptUri ? (
              <View style={styles.receiptPreviewWrapper}>
                <Image source={{ uri: receiptUri }} style={styles.receiptPreview} contentFit="cover" />
                <Pressable
                  onPress={() => setReceiptUri(undefined)}
                  style={styles.removeReceiptBtn}
                  accessibilityRole="button"
                  accessibilityLabel={t('transactions.removeReceipt', 'Remove receipt')}
                >
                  <Ionicons name="close-circle" size={26} color={COLORS.error} />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={handlePickReceipt}
                style={styles.attachReceiptButton}
                accessibilityRole="button"
                accessibilityLabel={t('transactions.attachReceipt', 'Attach Receipt')}
              >
                <Ionicons name="camera-outline" size={22} color={COLORS.primary} />
                <AppText variant="bodyMedium" style={styles.attachReceiptText}>
                  {t('transactions.attachReceiptBtn', 'Attach Receipt or Photo')}
                </AppText>
              </Pressable>
            )}
          </View>

          <Button title={t('transactions.saveBtn', 'Save Transaction')} onPress={save} style={styles.saveButton} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { minHeight: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.outlineVariant },
  backButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md },
  title: { flex: 1, textAlign: 'center', color: COLORS.textPrimary },
  headerSpacer: { width: 48 },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: SPACING.lg, paddingBottom: SPACING.xxl, gap: SPACING.xs },
  label: { color: COLORS.textPrimary, marginBottom: SPACING.xs },
  types: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.md },
  typeButton: { minWidth: '30%', minHeight: 48, flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.outlineVariant, backgroundColor: COLORS.surfaceContainerLowest },
  typeButtonActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryContainer },
  typeText: { color: COLORS.textSecondary, textTransform: 'capitalize' },
  typeTextActive: { color: COLORS.onPrimaryContainer },
  receiptSection: {
    marginVertical: SPACING.sm,
  },
  attachReceiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.outline,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  attachReceiptText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  receiptPreviewWrapper: {
    position: 'relative',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    height: 140,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  receiptPreview: {
    width: '100%',
    height: '100%',
  },
  removeReceiptBtn: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: RADIUS.round,
  },
  saveButton: { width: '100%', marginTop: SPACING.sm },
});
