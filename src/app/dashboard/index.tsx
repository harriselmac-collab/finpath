import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { useOnboardingStore } from '../../store/onboardingStore';

export default function DashboardScreen() {
  const router = useRouter();
  const { resetOnboarding, answers, debts } = useOnboardingStore();

  const handleReset = () => {
    resetOnboarding();
    router.replace('/');
  };

  const currency = answers['currency'] || 'MAD';

  // Basic calculation summary
  const mainIncome = Number(answers['mainIncome'] || 0);
  const secondIncome = Number(answers['secondIncome'] || 0);
  const totalIncome = mainIncome + secondIncome;

  const rentOrMortgage = Number(answers['housingAmount'] || 0);
  const totalDebts = debts.reduce((sum, d) => sum + d.totalAmount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>🎉 Onboarding Completed!</Text>
          <Text style={styles.subtitle}>Welcome to your FinPath Dashboard</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardHeader}>Profile Summary:</Text>
          <Text style={styles.infoLine}>• Name: {answers['preferredName'] || 'Guest'}</Text>
          <Text style={styles.infoLine}>• Location: {answers['city']}, {answers['country']}</Text>
          <Text style={styles.infoLine}>
            • Total Monthly Income: {currency} {totalIncome}
          </Text>
          <Text style={styles.infoLine}>
            • Housing Payment: {currency} {rentOrMortgage}
          </Text>
          {debts.length > 0 && (
            <Text style={styles.infoLine}>
              • Total Debts Tracked: {currency} {totalDebts} across {debts.length} debt sources
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          <Button title="Reset & Re-run Onboarding" onPress={handleReset} variant="destructive" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmBackground,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.darkEmerald,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginVertical: SPACING.xl,
  },
  cardHeader: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  infoLine: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  actions: {
    width: '100%',
  },
});
