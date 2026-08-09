import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Card } from '../ui/Card';
import AppText from '../Text/AppText';
import { legalDocuments, type LegalDocumentKind } from '../../constants/legalDocuments';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { normalizeLanguageCode } from '../../services/localization/languages';

export function LegalDocumentScreen({ kind }: { kind: LegalDocumentKind }) {
  const router = useRouter();
  const { i18n, t } = useTranslation();
  const language = normalizeLanguageCode(i18n.resolvedLanguage || i18n.language);
  const document = legalDocuments[language][kind];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}
          accessibilityRole="button"
          accessibilityLabel={t('common.back', 'Back')}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <AppText variant="bodySemiBold" style={styles.headerTitle}>{document.title}</AppText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.card} shadow="none">
          <AppText variant="caption" style={styles.meta}>{document.meta}</AppText>
          {document.sections.map((section) => (
            <View key={section.heading} style={styles.section}>
              <AppText variant="bodySemiBold" style={styles.heading} accessibilityRole="header">
                {section.heading}
              </AppText>
              {section.paragraphs.map((paragraph) => (
                <AppText key={paragraph} variant="legalBody" style={styles.body}>
                  {paragraph}
                </AppText>
              ))}
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderBottomColor: COLORS.outlineVariant,
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 56,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  backButton: { alignItems: 'center', justifyContent: 'center', minHeight: 44, minWidth: 44 },
  headerTitle: { color: COLORS.primary, flex: 1, textAlign: 'center' },
  headerSpacer: { width: 44 },
  scrollContent: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderColor: COLORS.outlineVariant,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
  },
  meta: { color: COLORS.textSecondary, marginBottom: SPACING.sm },
  section: { marginTop: SPACING.md },
  heading: { color: COLORS.primary, marginBottom: SPACING.xs },
  body: { color: COLORS.textPrimary, lineHeight: 24, marginBottom: SPACING.sm },
});
