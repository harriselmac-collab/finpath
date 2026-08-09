import React, { type ComponentProps, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import {
  getThemePreference,
  saveThemePreference,
  type ThemePreference,
} from '../../services/theme';

export default function AppearanceScreen() {
  const router = useRouter();
  const [theme, setTheme] = useState<ThemePreference>('system');
  const resolvedTheme = useColorScheme() === 'dark' ? 'dark' : 'light';

  useEffect(() => {
    let mounted = true;
    getThemePreference().then((preference) => {
      if (mounted) setTheme(preference);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleThemeChange = async (selectedTheme: ThemePreference) => {
    const previousTheme = theme;
    setTheme(selectedTheme);
    try {
      await saveThemePreference(selectedTheme);
    } catch {
      setTheme(previousTheme);
      Alert.alert('Theme not saved', 'Please try changing the appearance again.');
    }
  };

  const renderThemeOption = (
    label: string,
    value: ThemePreference,
    icon: ComponentProps<typeof Ionicons>['name'],
  ) => {
    const isSelected = theme === value;
    return (
      <TouchableOpacity
        key={value}
        style={[styles.themeItem, isSelected && styles.themeItemSelected]}
        onPress={() => void handleThemeChange(value)}
        accessibilityRole="radio"
        accessibilityLabel={label}
        accessibilityState={{ checked: isSelected }}
        aria-checked={isSelected}
      >
        <View style={styles.themeIdentity}>
          <Ionicons name={icon} size={20} color={isSelected ? COLORS.secondary : COLORS.textSecondary} />
          <Text style={[styles.themeText, isSelected && styles.themeTextSelected]}>{label}</Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appearance</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Text style={styles.sectionHeader}>Theme Mode</Text>
          <Text style={styles.supportingText}>
            {theme === 'system' ? `Following your device (${resolvedTheme})` : `Using ${theme} mode`}
          </Text>
          <View style={styles.list}>
            {renderThemeOption('Light Mode (Cool Cloud)', 'light', 'sunny-outline')}
            {renderThemeOption('Dark Mode (Deep Navy)', 'dark', 'moon-outline')}
            {renderThemeOption('Follow System Defaults', 'system', 'phone-portrait-outline')}
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
  sectionHeader: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  list: {
    gap: SPACING.xs,
  },
  supportingText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: -SPACING.xs,
    marginBottom: SPACING.md,
  },
  themeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surface,
  },
  themeItemSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.mintBackground,
  },
  themeIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  themeText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  themeTextSelected: {
    color: COLORS.secondary,
  },
});
