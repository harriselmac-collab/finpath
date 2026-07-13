import React, { useState } from 'react';
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
import { useOnboardingStore } from '../../../store/onboardingStore';
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
  const { answers } = useOnboardingStore();
  const currencySymbol = answers['currency'] || 'MAD';

  const [transactions, setTransactions] = useState<TransactionItem[]>([
    { id: '1', name: 'Grocery Store', amount: 450, type: 'essential', category: 'Essential', date: '09:41 AM', timeGroup: 'Today' },
    { id: '2', name: "L'Hote Cafe", amount: 35, type: 'flexible', category: 'Lifestyle', date: '08:15 AM', timeGroup: 'Today' },
    { id: '3', name: 'Salary Deposit', amount: 15000, type: 'income', category: 'Income', date: '03:00 PM', timeGroup: 'Yesterday' },
    { id: '4', name: 'Rent Payment', amount: 2500, type: 'essential', category: 'Essential', date: '10:00 AM', timeGroup: 'Yesterday' },
    { id: '5', name: 'Shell Gas Station', amount: 320, type: 'essential', category: 'Transport', date: '07:45 AM', timeGroup: 'Yesterday' },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'essential' | 'flexible' | 'debt' | 'savings'>('flexible');
  const [category, setCategory] = useState('Groceries');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'income' | 'essential' | 'flexible'>('all');
  const [quickInput, setQuickInput] = useState('');
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');

  const handleQuickAdd = () => {
    const parsed = parseQuickEntry(quickInput);
    if (!parsed) {
      Alert.alert('Error', 'Could not parse entry. Format: "coffee 45" or "rent 2500"');
      return;
    }

    const newTx: TransactionItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: parsed.name,
      amount: parsed.amount,
      type: parsed.type,
      category: parsed.category,
      date: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timeGroup: 'Today',
    };

    setTransactions([newTx, ...transactions]);
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

    const newTx: TransactionItem = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      amount: amt,
      type,
      category,
      date: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timeGroup: 'Today',
    };

    setTransactions([newTx, ...transactions]);
    setName('');
    setAmount('');
    setShowForm(false);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((tx) => tx.id !== id));
  };

  const filteredTransactions = transactions.filter((tx) => {
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

  const groupedTransactions = filteredTransactions.reduce((acc, tx) => {
    if (!acc[tx.timeGroup]) acc[tx.timeGroup] = [];
    acc[tx.timeGroup].push(tx);
    return acc;
  }, {} as Record<string, TransactionItem[]>);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Transactions</Text>
            <Text style={styles.subtitle}>Track your monthly logs and cash flows</Text>
          </View>
          <Button
            title={showForm ? 'Close' : '+ Add'}
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
              placeholder="Search transactions..."
              containerStyle={styles.searchInput}
            />
          </View>
        </View>

        {/* Quick Entry */}
        <View style={styles.quickEntryRow}>
          <Input
            value={quickInput}
            onChangeText={setQuickInput}
            placeholder="Quick Add (e.g. coffee 45 or rent 2500)..."
            containerStyle={styles.quickInputStyle}
          />
          <Button
            title="Add"
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
                Ready to add: <Text style={{ fontWeight: '700' }}>{parsed.name}</Text> ({parsed.category}) - <Text style={{ fontWeight: '700', color: parsed.type === 'income' ? COLORS.secondary : COLORS.textPrimary }}>{formatCurrency(parsed.amount, currencySymbol)}</Text>
              </Text>
            </View>
          );
        })()}

        {/* Form */}
        {showForm && (
          <Card style={styles.formDrawer}>
            <Text style={styles.formTitle}>Add Transaction</Text>
            <Input label="Name" value={name} onChangeText={setName} placeholder="e.g. Electric Bill" />
            <Input label={`Amount (${currencySymbol})`} value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="numeric" />
            
            <Text style={styles.label}>Type</Text>
            <View style={styles.typesRow}>
              {['income', 'essential', 'flexible'].map((tType) => (
                <TouchableOpacity
                  key={tType}
                  style={[styles.typeButton, type === tType && styles.typeButtonActive]}
                  onPress={() => setType(tType as any)}
                >
                  <Text style={[styles.typeText, type === tType && styles.typeTextActive]}>
                    {tType.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input label="Category" value={category} onChangeText={setCategory} placeholder="e.g. Utilities, Salary" />
            
            <Button title="Save Transaction" onPress={handleAddTransaction} variant="primary" style={styles.saveBtn} />
          </Card>
        )}

        {/* Tab Switcher */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'expense' && styles.tabItemActive]}
            onPress={() => setActiveTab('expense')}
          >
            <Text style={[styles.tabText, activeTab === 'expense' && styles.tabTextActive]}>Expenses</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'income' && styles.tabItemActive]}
            onPress={() => setActiveTab('income')}
          >
            <Text style={[styles.tabText, activeTab === 'income' && styles.tabTextActive]}>Income</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <View style={styles.chipRow}>
            {['all', 'income', 'essential', 'flexible'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.chip, selectedFilter === tab && styles.chipActive]}
                onPress={() => setSelectedFilter(tab as any)}
              >
                <Text style={[styles.chipText, selectedFilter === tab && styles.chipTextActive]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Transaction List */}
        {Object.keys(groupedTransactions).length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="No transactions found"
            description="Try adjusting your search or add a new transaction to get started."
            actionLabel="Add Transaction"
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
});
