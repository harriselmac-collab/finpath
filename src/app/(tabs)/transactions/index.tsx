import React, { useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Pressable,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../constants/theme';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useTranslation } from 'react-i18next';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { useTransactionsStore } from '../../../store/transactionsStore';
import { formatCurrency } from '../../../utils/currency';
import { parseQuickEntry } from '../../../utils/nlpParser';
import AppText from '../../../components/Text/AppText';
import { useTabContentBottomInset } from '../../../hooks/useTabContentBottomInset';

interface TransactionItem {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'essential' | 'flexible' | 'debt' | 'savings' | 'refund' | 'transfer';
  category: string;
  date: string;
  timeGroup: string;
  receiptUri?: string;
}

export default function TransactionsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { answers } = useOnboardingStore();
  const currencySymbol = answers['currency'] || 'MAD';
  const locale = i18n.resolvedLanguage || i18n.language;
  const contentBottomInset = useTabContentBottomInset();

  // Transactions store
  const {
    transactions: storedTransactions,
    addTransaction,
    removeTransaction,
  } = useTransactionsStore();

  // Local state for UI (form values, filters, etc.)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'income' | 'essential' | 'flexible' | 'debt' | 'savings' | 'refund' | 'transfer'>('all');
  const [quickInput, setQuickInput] = useState('');
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [previewReceiptUri, setPreviewReceiptUri] = useState<string | null>(null);
  const chipScrollRef = useRef<ScrollView>(null);

  const handleQuickAdd = () => {
    const parsed = parseQuickEntry(quickInput);
    if (!parsed) {
      Alert.alert(t('common.error', 'Error'), t('transactions.quickAddError', 'Use a name and amount, such as “coffee 45”.'));
      return;
    }

    const now = new Date();
    const newTx: Omit<TransactionItem, 'id'> = {
      name: parsed.name,
      amount: parsed.amount,
      type: parsed.type,
      category: parsed.category,
      date: now.toLocaleDateString(locale, { month: 'short', day: 'numeric' }),
      timeGroup: now.toLocaleDateString(locale, { month: 'long' }),
    };

    addTransaction(newTx);
    setQuickInput('');
  };

  const handleDeleteTransaction = (id: string) => {
    Alert.alert(
      t('transactions.deleteTitle', 'Delete transaction?'),
      t('transactions.deleteMessage', 'This transaction will be permanently removed.'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        { text: t('transactions.delete', 'Delete'), style: 'destructive', onPress: () => removeTransaction(id) },
      ],
    );
  };

  const filteredTransactions = storedTransactions.filter((tx) => {
    const matchesSearch = tx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tx.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'expense' ? tx.type !== 'income' && tx.type !== 'refund' : tx.type === 'income' || tx.type === 'refund';
    const matchesFilter = selectedFilter === 'all' || tx.type === selectedFilter;
    return matchesSearch && matchesTab && matchesFilter;
  });

  const getCategoryIcon = (category: string): string => {
    const map: Record<string, string> = {
      'Housing': 'home-outline',
      'Salary': 'cash-outline',
      'Groceries': 'basket-outline',
      'Subscriptions': 'repeat-outline',
      'Transport': 'car-outline',
      'Food': 'restaurant-outline',
      'Health': 'medkit-outline',
      'Essential': 'shield-checkmark-outline',
      'Lifestyle': 'cafe-outline',
      'Income': 'cash-outline',
    };
    return map[category] || 'receipt-outline';
  };

  const getCategoryColor = (type: string): string => {
    switch (type) {
      case 'income':
        return COLORS.secondary;
      case 'essential':
        return COLORS.primary;
      case 'flexible':
        return COLORS.warning;
      case 'debt':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  // Group transactions by timeGroup for display
  const groupedTransactions = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => {
      if (!acc[tx.timeGroup]) acc[tx.timeGroup] = [];
      acc[tx.timeGroup].push(tx);
      return acc;
    }, {} as Record<string, TransactionItem[]>);
  }, [filteredTransactions]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: contentBottomInset }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <AppText variant="headlineMd" style={styles.title}>{t('transactions.title', 'Transactions')}</AppText>
            <AppText variant="labelSm" style={styles.subtitle}>{t('transactions.subtitle', 'Track your monthly logs and cash flows')}</AppText>
          </View>
          {storedTransactions.length > 0 && (
            <Button
              title={t('transactions.add', '+ Add')}
              onPress={() => router.push('/transaction-form')}
              variant="primary"
              style={styles.headerAddBtn}
            />
          )}
        </View>

        {/* Search */}
        <Input
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('transactions.searchPlaceholder', 'Search transactions...')}
          containerStyle={styles.searchInput}
          leadingIcon={<Ionicons name="search" size={20} color={COLORS.textSecondary} accessible={false} />}
          trailingIcon={searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')} accessibilityRole="button" accessibilityLabel={t('transactions.clearSearch', 'Clear search')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} accessible={false} />
            </Pressable>
          ) : null}
        />

        {/* Quick Entry */}
        <View style={styles.quickEntryRow}>
          <Input
            value={quickInput}
            onChangeText={setQuickInput}
            placeholder={t('transactions.quickAddPlaceholder', 'Quick Add (e.g. coffee 45 or rent 2500)...')}
            containerStyle={styles.quickInputStyle}
          />
          <Button
            title={t('transactions.quickAddButton', 'Add')}
            onPress={handleQuickAdd}
            variant="secondary"
            style={styles.parseBtn}
          />
        </View>

        {quickInput.trim().length > 0 && (() => {
          const parsed = parseQuickEntry(quickInput);
          if (!parsed) return null;
          return (
            <View style={styles.previewBox}>
              <AppText variant="caption" style={styles.previewText}>
                {t('transactions.readyToAdd', { defaultValue: 'Ready to add: {{name}} ({{category}}) - {{amount}}', name: parsed.name, category: parsed.category, amount: formatCurrency(parsed.amount, currencySymbol, locale) })}
              </AppText>
            </View>
          );
        })()}

        {/* Tab Switcher */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'expense' && styles.tabItemActive]}
            onPress={() => setActiveTab('expense')}
          >
            <AppText variant="labelSm" style={[styles.tabText, activeTab === 'expense' && styles.tabTextActive]}>{t('transactions.tabExpenses', 'Expenses')}</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'income' && styles.tabItemActive]}
            onPress={() => setActiveTab('income')}
          >
            <AppText variant="labelSm" style={[styles.tabText, activeTab === 'income' && styles.tabTextActive]}>{t('transactions.tabIncome', 'Income')}</AppText>
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <ScrollView ref={chipScrollRef} horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipScrollContent}>
          <View style={styles.chipRow}>
            {(['all', 'income', 'essential', 'flexible', 'debt', 'savings', 'refund', 'transfer'] as const).map((tab, index) => (
              <TouchableOpacity
                key={tab}
                style={[styles.chip, selectedFilter === tab && styles.chipActive]}
                onPress={() => {
                  setSelectedFilter(tab);
                  chipScrollRef.current?.scrollTo({ x: index * 96, animated: true });
                }}
              >
                <AppText variant="labelSm" style={[styles.chipText, selectedFilter === tab && styles.chipTextActive]}>
                  {t(`transactions.filters.${tab}`, tab.charAt(0).toUpperCase() + tab.slice(1))}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Transaction List */}
        {Object.keys(groupedTransactions).length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title={t('transactions.noTransactions', 'No transactions found')}
            description={t('transactions.noTransactionsDesc', 'Try adjusting your search or add a new transaction to get started.')}
            actionLabel={t('transactions.addTitle', 'Add Transaction')}
            onAction={() => router.push('/transaction-form')}
          />
        ) : (
          <View style={styles.listContainer}>
            {Object.entries(groupedTransactions).map(([group, txs]) => (
              <View key={group} style={styles.groupContainer}>
                <AppText variant="labelSm" style={styles.groupLabel}>{group}</AppText>
                <Card style={styles.groupCard}>
                  {txs.map((tx, index) => (
                    <TouchableOpacity
                      key={tx.id}
                      activeOpacity={0.7}
                      onPress={() => router.push({ pathname: '/transaction-form', params: { transactionId: tx.id } })}
                    >
                      <View style={[
                        styles.txRow,
                        index < txs.length - 1 && styles.txDivider,
                      ]}>
                        <View style={[styles.txIconBox, { backgroundColor: `${getCategoryColor(tx.type)}15` }]}>
                          <Ionicons name={getCategoryIcon(tx.category) as any} size={22} color={getCategoryColor(tx.type)} />
                        </View>
                        <View style={styles.txMeta}>
                          <AppText variant="bodySemiBold" style={styles.txName}>{tx.name}</AppText>
                          <View style={styles.txMetaRow}>
                            <View style={[styles.categoryChip, { backgroundColor: `${getCategoryColor(tx.type)}15` }]}>
                              <AppText variant="labelSm" style={[styles.categoryChipText, { color: getCategoryColor(tx.type) }]}>
                                {tx.category}
                              </AppText>
                            </View>
                            <AppText variant="caption" style={styles.txDate}>{tx.date}</AppText>
                            {Boolean(tx.receiptUri) && (
                              <TouchableOpacity
                                onPress={() => setPreviewReceiptUri(tx.receiptUri || null)}
                                style={styles.receiptChip}
                                accessibilityRole="button"
                                accessibilityLabel={t('transactions.viewReceipt', 'View receipt')}
                              >
                                <Ionicons name="receipt-outline" size={12} color={COLORS.primary} />
                                <AppText variant="caption" style={styles.receiptChipText}>{t('transactions.receipt', 'Receipt')}</AppText>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                        <View style={styles.txAmountSec}>
                          <AppText variant="amountMd" style={[styles.txAmount, tx.type === 'income' ? styles.txAmountGreen : styles.txAmountDefault]}>
                            {tx.type === 'income' || tx.type === 'refund' ? '+' : tx.type === 'transfer' ? '' : '-'} {formatCurrency(tx.amount, currencySymbol, locale)}
                          </AppText>
                          <TouchableOpacity onPress={() => handleDeleteTransaction(tx.id)} style={styles.deleteBtn}>
                            <Ionicons name="trash-outline" size={16} color={COLORS.textSecondary} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </Card>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Receipt Full Preview Modal */}
      <Modal
        visible={Boolean(previewReceiptUri)}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewReceiptUri(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setPreviewReceiptUri(null)}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <AppText variant="bodySemiBold" style={styles.modalTitle}>{t('transactions.receiptPreview', 'Receipt Photo')}</AppText>
              <TouchableOpacity onPress={() => setPreviewReceiptUri(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            {previewReceiptUri && (
              <Image source={{ uri: previewReceiptUri }} style={styles.modalImage} contentFit="contain" />
            )}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  title: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.textPrimary,
  },
  subtitle: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerAddBtn: {
    height: 44,
    paddingHorizontal: SPACING.md,
  },
  searchInput: {
    marginBottom: 0,
  },
  quickEntryRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  quickInputStyle: {
    flex: 1,
    marginBottom: 0,
  },
  parseBtn: {
    height: 52,
    paddingHorizontal: SPACING.md,
  },
  previewBox: {
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  previewText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: RADIUS.md,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  tabItemActive: {
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  tabText: {
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  chipScroll: {
    maxHeight: 40,
  },
  chipScrollContent: {
    paddingRight: SPACING.lg,
  },
  chipRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surfaceContainer,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  chipActive: {
    backgroundColor: COLORS.primaryContainer,
    borderColor: COLORS.primaryContainer,
  },
  chipText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.white,
  },
  listContainer: {
    gap: SPACING.md,
  },
  groupContainer: {
    gap: SPACING.xs,
  },
  groupLabel: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.05,
    marginLeft: SPACING.xs,
  },
  groupCard: {
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  txDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  txIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txMeta: {
    flex: 1,
  },
  txName: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  txDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  txAmountSec: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  txAmount: {
    ...TYPOGRAPHY.amountMd,
    fontSize: 14,
  },
  txAmountGreen: {
    color: COLORS.secondary,
  },
  txAmountDefault: {
    color: COLORS.textPrimary,
  },
  deleteBtn: {
    padding: SPACING.xs,
  },
  txMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: 2,
  },
  categoryChip: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  categoryChipText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  receiptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  receiptChipText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: COLORS.textPrimary,
  },
  modalCloseBtn: {
    padding: SPACING.xs,
  },
  modalImage: {
    width: '100%',
    height: 320,
    borderRadius: RADIUS.md,
  },
});
