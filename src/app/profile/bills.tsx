import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { useOnboardingStore } from '../../store/onboardingStore';

export default function BillsScreen() {
  const router = useRouter();
  const { answers } = useOnboardingStore();

  const parseAmount = (val: any) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const rent = parseAmount(answers.monthlyRent);
  const utilities = parseAmount(answers.monthlyUtilities);
  const subscription = parseAmount(answers.monthlySubscription);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recurring Bills</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Essential Monthly Commitments</Text>
          
          <View style={styles.row}>
            <View style={styles.labelContainer}>
              <Ionicons name="home-outline" size={18} color={COLORS.primary} style={styles.icon} />
              <Text style={styles.label}>Rent / Mortgage</Text>
            </View>
            <Text style={styles.value}>{rent} {answers.currency || 'MAD'}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.labelContainer}>
              <Ionicons name="flash-outline" size={18} color={COLORS.primary} style={styles.icon} />
              <Text style={styles.label}>Utilities & Internet</Text>
            </View>
            <Text style={styles.value}>{utilities} {answers.currency || 'MAD'}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.labelContainer}>
              <Ionicons name="play-outline" size={18} color={COLORS.primary} style={styles.icon} />
              <Text style={styles.label}>Subscriptions</Text>
            </View>
            <Text style={styles.value}>{subscription} {answers.currency || 'MAD'}</Text>
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
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: '600',
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
