import React, { useState, useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../../constants/theme';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useTranslation } from 'react-i18next';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { useTransactionsStore } from '../../../store/transactionsStore';
import { formatCurrency } from '../../../utils/currency';
import { parseQuickEntry } from '../../../utils/nlpParser';

interface TransactionItem {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'essential' | 'flexible' | 'debt' | 'savings';
  category: string;
  date: string;
  timeGroup: string;
}

export default function TransactionsScreen() {
  const { t } = useTranslation();
  const { answers } = useOnboardingStore();
  const currencySymbol = answers['currency'] || 'MAD';

  // Transactions store
  const {
    transactions: storedTransactions,
    addTransaction,
    removeTransaction,
    updateTransaction,
  } = useTransactionsStore();

  // Local state for UI (form values, filters, etc.)
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'essential' | 'flexible' | 'debt' | 'savings'>('flexible');
  const [category, setCategory] = useState('Groceries');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'income' | 'essential' | 'flexible' | 'debt' | 'savings'>('all');
  const [quickInput, setQuickInput] = useState('');
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);

  const params = useLocalSearchParams<{ openForm?: string; actionType?: string }>();

  // Open the add/edit transaction drawer when navigated with URL query params
  React.useEffect(() => {
    if (params.openForm === 'true') {
      requestAnimationFrame(() => {
        setShowForm(true);
        if (params.actionType) {
          setType(params.actionType as any);
          if (params.actionType === 'income') {
            setActiveTab('income');
          } else {
            setActiveTab('expense');
          }
        }
      });
    }
  }, [params.openForm, params.actionType]);

  // Populate form when editing a transaction
  React.useEffect(() => {
    if (editingTransactionId) {
      requestAnimationFrame(() => {
        const transaction = storedTransactions.find(t => t.id === editingTransactionId);
        if (transaction) {
          setName(transaction.name);
          setAmount(transaction.amount.toString());
          setType(transaction.type);
          setCategory(transaction.category);
        }
      });
    }
  }, [editingTransactionId, storedTransactions]);

  const handleQuickAdd = () => {
    const parsed = parseQuickEntry(quickInput);
    if (!parsed) {
      Alert.alert('Error', 'Could not parse entry. Format: "coffee 45" or "rent 2500"');
      return;
    }

    const now = new Date();
const newTx: Omit<TransactionItem, 'id'> = {
      name: parsed.name,
      amount: parsed.amount,
      type: parsed.type,
      category: parsed.category,
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timeGroup: now.toLocaleDateString('en-US', { month: 'short' }),
    };

    addTransaction(newTx);
    setQuickInput('');
  };

  const handleAddTransaction = () => {
    if (!name || !amount) {
      Alert.alert('Error', 'Please fill in name and amount');
      return;
    }
    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Error', 'Please enter a valid positive amount');
      return;
    }

    const now = new Date();
    const txData = {
      name,
      amount: amt,
      type,
      category,
      date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timeGroup: now.toLocaleDateString('en-US', { month: 'short' }),
    };

    if (editingTransactionId) {
      // Update existing transaction
      updateTransaction(editingTransactionId, txData);
      setEditingTransactionId(null);
    } else {
      // Add new transaction
      addTransaction(txData);
    }

    setName('');
    setAmount('');
    setShowForm(false);
  };

  const handleDeleteTransaction = (id: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeTransaction(id) }
      ]
    );
  };

  const filteredTransactions = storedTransactions.filter((tx) => {
    const matchesSearch = tx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tx.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'expense' ? tx.type !== 'income' : tx.type === 'income';
    const matchesFilter = selectedFilter === 'all' || tx.type === selectedFilter;
    return matchesSearch && matchesTab && matchesFilter;
  });

  const getCategoryIcon = (category: string): string => {
    const map: Record<string, string> = {
      'Housing': 'home',
      'Salary': 'payments',
      'Groceries': 'shopping-basket',
      'Subscriptions': 'subscriptions',
      'Transport': 'local-gas-station',
      'Food': 'restaurant',
      'Health': 'medical-services',
      'Essential': 'home',
      'Lifestyle': 'cafe',
      'Income': 'payments',
    };
    return map[category] || 'receipt';
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t('transactions.title', 'Transactions')}</Text>
            <Text style={styles.subtitle}>{t('transactions.subtitle', 'Track your monthly logs and cash flows')}</Text>
          </View>
          <Button
            title={showForm ? t('transactions.close', 'Close') : t('transactions.add', '+ Add')}
            onPress={() => setShowForm(!showForm)}
            variant="primary"
            style={styles.headerAddBtn}
          />
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
            <Input
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('transactions.searchPlaceholder', 'Search transactions...')}
              containerStyle={styles.searchInput}
            />
          </View>
        </View>

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
              <Text style={styles.previewText}>
                {t('transactions.readyToAdd', { defaultValue: 'Ready to add: {{name}} ({{category}}) - {{amount}}', name: parsed.name, category: parsed.category, amount: formatCurrency(parsed.amount, currencySymbol) })}
              </Text>
            </View>
          );
        })()}

        {/* Form */}
        {showForm && (
          <Card style={styles.formDrawer}>
            <Text style={styles.formTitle}>{editingTransactionId ? t('transactions.editTitle', 'Edit Transaction') : t('transactions.addTitle', 'Add Transaction')}</Text>
            <Input label={t('transactions.nameLabel', 'Name')} value={name} onChangeText={setName} placeholder="e.g. Electric Bill" />
            <Input label={`${t('transactions.amountLabel', 'Amount')} (${currencySymbol})`} value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="numeric" />

            <Text style={styles.label}>{t('transactions.typeLabel', 'Type')}</Text>
            <View style={styles.typesRow}>
              {['income', 'essential', 'flexible', 'debt', 'savings'].map((tType) => (
                <TouchableOpacity
                  key={tType}
                  style={[styles.typeButton, type === tType && styles.typeButtonActive]}
                  onPress={() => setType(tType as any)}
                >
                  <Text style={[styles.typeText, type === tType && styles.typeTextActive]}>
                    {t(`transactions.filters.${tType}`, tType.toUpperCase())}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input label={t('transactions.categoryLabel', 'Category')} value={category} onChangeText={setCategory} placeholder="e.g. Utilities, Salary" />

            <Button title={t('transactions.saveBtn', 'Save Transaction')} onPress={handleAddTransaction} variant="primary" style={styles.saveBtn} />
          </Card>
        )}

        {/* Tab Switcher */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'expense' && styles.tabItemActive]}
            onPress={() => setActiveTab('expense')}
          >
            <Text style={[styles.tabText, activeTab === 'expense' && styles.tabTextActive]}>{t('transactions.tabExpenses', 'Expenses')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'income' && styles.tabItemActive]}
            onPress={() => setActiveTab('income')}
          >
            <Text style={[styles.tabText, activeTab === 'income' && styles.tabTextActive]}>{t('transactions.tabIncome', 'Income')}</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <View style={styles.chipRow}>
            {['all', 'income', 'essential', 'flexible', 'debt', 'savings'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.chip, selectedFilter === tab && styles.chipActive]}
                onPress={() => setSelectedFilter(tab as any)}
              >
                <Text style={[styles.chipText, selectedFilter === tab && styles.chipTextActive]}>
                  {t(`transactions.filters.${tab}`, tab.charAt(0).toUpperCase() + tab.slice(1))}
                </Text>
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
            onAction={() => setShowForm(true)}
          />
        ) : (
          <View style={styles.listContainer}>
            {Object.entries(groupedTransactions).map(([group, txs]) => (
              <View key={group} style={styles.groupContainer}>
                <Text style={styles.groupLabel}>{group}</Text>
                <Card style={styles.groupCard}>
                  {txs.map((tx, index) => (
                    <TouchableOpacity
                      key={tx.id}
                      activeOpacity={0.7}
                      onPress={() => {}}
                    >
                      <View style={[
                        styles.txRow,
                        index < txs.length - 1 && styles.txDivider,
                      ]}>
                        <View style={[styles.txIconBox, { backgroundColor: `${getCategoryColor(tx.type)}15` }]}>
                          <Ionicons name={getCategoryIcon(tx.category) as any} size={22} color={getCategoryColor(tx.type)} />
                        </View>
                        <View style={styles.txMeta}>
                          <Text style={styles.txName}>{tx.name}</Text>
                          <View style={styles.txMetaRow}>
                            <View style={[styles.categoryChip, { backgroundColor: `${getCategoryColor(tx.type)}15` }]}>
                              <Text style={[styles.categoryChipText, { color: getCategoryColor(tx.type) }]}>
                                {tx.category}
                              </Text>
                            </View>
                            <Text style={styles.txDate}>{tx.date}</Text>
                          </View>
                        </View>
                        <View style={styles.txAmountSec}>
                          <Text style={[styles.txAmount, tx.type === 'income' ? styles.txAmountGreen : styles.txAmountDefault]}>
                            {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount, currencySymbol)}
                          </Text>
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
  searchBar: {
    marginBottom: SPACING.xs,
  },
  searchInputContainer: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: [{ translateY: -50 }],
    zIndex: 1,
  },
  searchInput: {
    marginBottom: 0,
    paddingLeft: SPACING.xl,
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
  formDrawer: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  formTitle: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.primary,
    fontSize: 16,
    marginBottom: SPACING.xs,
  },
  label: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  typesRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  typeButton: {
    flex: 1,
    height: 40,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryContainer,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  typeTextActive: {
    color: COLORS.onPrimaryContainer,
  },
  saveBtn: {
    marginTop: SPACING.sm,
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
    ...SHADOWS.sm,
  },
  tabText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  chipScroll: {
    marginBottom: SPACING.xs,
  },
  chipRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  chip: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
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
});