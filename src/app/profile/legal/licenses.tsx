import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../constants/theme';
import { Card } from '../../../components/ui/Card';

export default function LegalLicensesScreen() {
  const router = useRouter();

  const dependencies = [
    { name: 'react', version: '19.2.3', license: 'MIT' },
    { name: 'react-native', version: '0.86.0', license: 'MIT' },
    { name: 'expo', version: '57.0.4', license: 'MIT' },
    { name: 'expo-router', version: '57.0.4', license: 'MIT' },
    { name: '@supabase/supabase-js', version: '2.110.2', license: 'MIT' },
    { name: 'react-native-reanimated', version: '4.5.0', license: 'MIT' },
    { name: 'zustand', version: '5.0.14', license: 'MIT' },
    { name: 'zod', version: '3.25.76', license: 'MIT' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Open-source Licences</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Text style={styles.sectionHeader}>Third-party Licences</Text>
          <Text style={styles.bodyText}>
            Pocket Ahead is built using open-source packages. Below is a list of the core dependencies and their licensing:
          </Text>

          {dependencies.map((dep) => (
            <View key={dep.name} style={styles.licenseItem}>
              <View style={styles.licenseRow}>
                <Text style={styles.depName}>{dep.name}</Text>
                <Text style={styles.depLicense}>{dep.license}</Text>
              </View>
              <Text style={styles.depVersion}>Version: {dep.version}</Text>
              <View style={styles.divider} />
            </View>
          ))}
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
  sectionHeader: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  bodyText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    lineHeight: 16,
    marginBottom: SPACING.md,
  },
  licenseItem: {
    marginBottom: SPACING.sm,
  },
  licenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  depName: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  depLicense: {
    ...TYPOGRAPHY.caption,
    color: COLORS.emerald,
    fontWeight: '600',
    backgroundColor: COLORS.mintBackground,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  depVersion: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
  },
});
