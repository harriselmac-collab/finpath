import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { useOnboardingStore } from '../../store/onboardingStore';
import { formatCurrency } from '../../utils/currency';

export default function IncomeScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const { answers } = useOnboardingStore();
  const currency = answers.currency || 'MAD';
  const locale = i18n.resolvedLanguage || i18n.language;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Income & Employment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Primary Employment</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Employment Status</Text>
            <Text style={styles.value}>
              {answers.employmentStatus
                ? answers.employmentStatus.charAt(0).toUpperCase() + answers.employmentStatus.slice(1)
                : 'Not Set'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Occupation</Text>
            <Text style={styles.value}>{answers.occupation || 'N/A'}</Text>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Monthly Cashflow</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Primary Income</Text>
            <Text style={styles.value}>
              {answers.monthlyIncome
                ? formatCurrency(Number(answers.monthlyIncome), currency, locale)
                : 'Not Set'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Additional Incomes</Text>
            <Text style={styles.value}>{answers.hasAdditionalIncome ? 'Yes' : 'No'}</Text>
          </View>
        </Card>
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
  card: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  sectionTitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.primary,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  label: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
  },
  value: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
  },
});
