import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../constants/theme';
import { Card } from '../../../components/ui/Card';

export default function LegalTermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Use</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Text style={styles.legalMeta}>Version: 1.0.0 | Effective: **[EFFECTIVE DATE]**</Text>
          
          <Text style={styles.h1}>1. Service Eligibility</Text>
          <Text style={styles.body}>
            By using FinPath, you declare you are at least 18 years old and hold legal capacity to accept these terms.
          </Text>

          <Text style={styles.h1}>2. User Account Security</Text>
          <Text style={styles.body}>
            You are solely responsible for caching secure authentication tokens, active passwords, and biometrics permissions on your device. FinPath uses Expo SecureStore for encrypted local keychain data.
          </Text>

          <Text style={styles.h1}>3. Acceptable Use Policy</Text>
          <Text style={styles.body}>
            You agree to use FinPath for lawful budgeting, expense analysis, and planning activities only. Any scraping, automated querying, or security circumvention is prohibited.
          </Text>

          <Text style={styles.h1}>4. Governing Law</Text>
          <Text style={styles.body}>
            These terms are governed by the laws of **[GOVERNING LAW]**.
          </Text>

          <Text style={styles.h1}>5. Liability Limitations</Text>
          <Text style={styles.body}>
            FinPath is provided "as is". **[LEGAL ENTITY NAME]** holds no liability for planning discrepancies, budget deficits, or financial decisions made based on AI insights.
          </Text>
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
  legalMeta: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  h1: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  body: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    lineHeight: 16,
    marginBottom: SPACING.sm,
  },
});
