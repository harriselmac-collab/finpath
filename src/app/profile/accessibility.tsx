import React from 'react';
import { I18nManager, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppText from '../../components/Text/AppText';
import { Card, Icon } from '../../components/ui';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

const SECTIONS = [
  { key: 'text', icon: 'text-outline' },
  { key: 'reader', icon: 'ear-outline' },
  { key: 'motion', icon: 'accessibility-outline' },
] as const;

export default function AccessibilityScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const title = t('support.accessibility.title');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}
          accessibilityRole="button"
          accessibilityLabel={t('support.accessibility.back')}
        >
          <Icon
            name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'}
            size={24}
            color={COLORS.primary}
          />
        </Pressable>
        <AppText variant="sectionTitle" style={styles.headerTitle} role="heading" aria-level={1}>
          {title}
        </AppText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        role="main"
        accessibilityLabel={title}
      >
        <AppText variant="screenTitle" style={styles.overviewTitle} role="heading" aria-level={2}>
          {t('support.accessibility.overviewTitle')}
        </AppText>
        <AppText variant="body" style={styles.overviewBody}>
          {t('support.accessibility.overviewBody')}
        </AppText>

        <Card style={styles.card} shadow="none">
          {SECTIONS.map((section, index) => (
            <View
              key={section.key}
              style={[styles.infoRow, index < SECTIONS.length - 1 && styles.divider]}
            >
              <View style={styles.iconBox}>
                <Icon name={section.icon} size={22} color={COLORS.surfaceTint} />
              </View>
              <View style={styles.infoCopy}>
                <AppText variant="bodySemiBold" style={styles.infoTitle} role="heading" aria-level={3}>
                  {t(`support.accessibility.${section.key}Title`)}
                </AppText>
                <AppText variant="supporting" style={styles.infoBody}>
                  {t(`support.accessibility.${section.key}Body`)}
                </AppText>
              </View>
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.round,
  },
  pressed: {
    opacity: 0.72,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.primary,
  },
  headerSpacer: {
    width: 44,
  },
  scrollContent: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: SPACING.lg,
  },
  overviewTitle: {
    color: COLORS.primary,
  },
  overviewBody: {
    maxWidth: 620,
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
  },
  card: {
    marginTop: SPACING.xl,
    padding: 0,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  infoRow: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    padding: SPACING.lg,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  iconBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.mintBackground,
  },
  infoCopy: {
    minWidth: 0,
    flex: 1,
  },
  infoTitle: {
    color: COLORS.textPrimary,
  },
  infoBody: {
    marginTop: 4,
    color: COLORS.textSecondary,
    lineHeight: 21,
  },
});
