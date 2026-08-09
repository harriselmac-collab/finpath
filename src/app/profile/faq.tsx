import React, { useState } from 'react';
import { I18nManager, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppText from '../../components/Text/AppText';
import { Card, Icon } from '../../components/ui';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

const FAQS = ['allowance', 'storage'] as const;

export default function FaqScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const title = t('support.faq.title');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}
          accessibilityRole="button"
          accessibilityLabel={t('support.faq.back')}
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
        {FAQS.map((faq, index) => {
          const expanded = expandedIndex === index;
          const question = t(`support.faq.${faq}Question`);
          return (
            <Card key={faq} style={styles.faqCard} shadow="none">
              <Pressable
                style={({ pressed }) => [styles.questionRow, pressed && styles.pressed]}
                onPress={() => setExpandedIndex(expanded ? null : index)}
                accessibilityRole="button"
                accessibilityLabel={question}
                accessibilityState={{ expanded }}
              >
                <AppText variant="bodySemiBold" style={styles.questionText} role="heading" aria-level={2}>
                  {question}
                </AppText>
                <Icon
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={COLORS.primary}
                />
              </Pressable>
              {expanded && (
                <View style={styles.answerContainer}>
                  <AppText variant="body" style={styles.answerText}>
                    {t(`support.faq.${faq}Answer`)}
                  </AppText>
                </View>
              )}
            </Card>
          );
        })}
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
    gap: SPACING.sm,
    padding: SPACING.lg,
  },
  faqCard: {
    padding: 0,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  questionRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
  },
  questionText: {
    minWidth: 0,
    flex: 1,
    color: COLORS.textPrimary,
  },
  answerContainer: {
    padding: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },
  answerText: {
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
});
