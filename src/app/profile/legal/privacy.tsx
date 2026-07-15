import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../constants/theme';
import { Card } from '../../../components/ui/Card';

export default function LegalPrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Text style={styles.legalMeta}>Version: 1.0.0 | Effective: **[EFFECTIVE DATE]**</Text>
          
          <Text style={styles.h1}>1. Identity of Controller</Text>
          <Text style={styles.body}>
            FinPath is owned and operated by **[LEGAL ENTITY NAME]**, registered at **[REGISTERED ADDRESS]**. 
            Contact email: **[PRIVACY CONTACT EMAIL]**.
          </Text>

          <Text style={styles.h1}>2. Data Categories Collected</Text>
          <Text style={styles.body}>
            We collect the following personal data categories:
          </Text>
          <Text style={styles.bullet}>• Onboarding assessment questions (country, city, income, dependencies).</Text>
          <Text style={styles.bullet}>• Debt records and personal goals entries.</Text>
          <Text style={styles.bullet}>• Core transaction logs (flexible expenses, recurring bills, income).</Text>
          <Text style={styles.bullet}>• Optional special-category data: Religion and cultural event preferences (subject to explicit consent, removable at any time).</Text>

          <Text style={styles.h1}>3. Purpose & Legal Basis</Text>
          <Text style={styles.body}>
            We process data to provide financial planning tools (performance of contract). Optional marketing or analytical data is processed subject to your consent. Special category data is only processed upon explicit consent.
          </Text>

          <Text style={styles.h1}>4. Retention & Deletion</Text>
          <Text style={styles.body}>
            We retain data for **[DATA RETENTION PERIOD]** or until you request account deletion. Account deletion requests can be submitted in-app or via our web portal.
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
  bullet: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    lineHeight: 16,
    paddingLeft: SPACING.sm,
    marginBottom: 4,
  },
});
