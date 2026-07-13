import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useOnboardingStore } from '../../store/onboardingStore';
import { QUIZ_QUESTIONS } from '../../features/onboarding/quizFlow';

export default function ReviewScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { answers, debts, setCurrentStep } = useOnboardingStore();

  const sections = [
    { id: 'personal', nameKey: 'onboarding.sections.personal' },
    { id: 'income', nameKey: 'onboarding.sections.income' },
    { id: 'housing', nameKey: 'onboarding.sections.housing' },
    { id: 'family', nameKey: 'onboarding.sections.family' },
    { id: 'vehicle', nameKey: 'onboarding.sections.vehicle' },
    { id: 'healthcare', nameKey: 'onboarding.sections.healthcare' },
    { id: 'debt', nameKey: 'onboarding.sections.debt' },
    { id: 'bills', nameKey: 'onboarding.sections.bills' },
    { id: 'annual', nameKey: 'onboarding.sections.annual' },
    { id: 'habits', nameKey: 'onboarding.sections.habits' },
    { id: 'cultural', nameKey: 'onboarding.sections.cultural' },
  ];

  // Navigate back to the first question of the edited section
  const handleEditSection = (sectionId: string) => {
    // Find index of the first question belonging to this section in the active question set
    // Let's compute active questions first
    const activeQuestions = QUIZ_QUESTIONS.filter((q) => {
      if (q.showIf) return q.showIf(answers);
      return true;
    });

    const firstIndex = activeQuestions.findIndex((q) => q.section === sectionId);
    if (firstIndex !== -1) {
      setCurrentStep(firstIndex);
      router.push('/onboarding/quiz');
    } else {
      // If the section doesn't have active questions, fall back to first step
      setCurrentStep(0);
      router.push('/onboarding/quiz');
    }
  };

  const handleConfirm = () => {
    router.push('/onboarding/essential-expenses');
  };

  const renderSectionContent = (sectionId: string) => {
    const currency = answers['currency'] || 'MAD';

    // Filter questions belonging to this section
    const sectionQuestions = QUIZ_QUESTIONS.filter((q) => q.section === sectionId);

    // If section is debt, display the debts list in addition
    if (sectionId === 'debt') {
      const hasDebt = answers['hasDebt'];
      return (
        <View style={styles.sectionFields}>
          <Text style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Has active debt: </Text>
            <Text style={styles.fieldValue}>{hasDebt ? 'Yes' : 'No'}</Text>
          </Text>
          {hasDebt && debts.length > 0 && (
            <View style={styles.debtsReviewList}>
              {debts.map((d, index) => (
                <Text key={index} style={styles.debtFieldText}>
                  • {d.type}: {currency} {d.totalAmount} (Interest: {d.interestRate}%, Min Payment: {currency} {d.minimumPayment})
                </Text>
              ))}
            </View>
          )}
        </View>
      );
    }

    return (
      <View style={styles.sectionFields}>
        {sectionQuestions.map((q) => {
          // If the question is not active in the flow, skip rendering it
          if (q.showIf && !q.showIf(answers)) return null;

          const val = answers[q.id];
          let displayVal = 'N/A';

          if (val === true) displayVal = t('common.yes');
          else if (val === false) displayVal = t('common.no');
          else if (val !== undefined && val !== null) displayVal = val.toString();

          // Add currency symbol to currency fields
          if (q.type === 'currency' && val !== undefined && val !== null) {
            displayVal = `${currency} ${val}`;
          }

          // Check if there are notes for this field
          const notes = answers[`${q.id}_notes`];

          return (
            <View key={q.id} style={styles.fieldItem}>
              <Text style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{t(q.titleKey)}: </Text>
                <Text style={styles.fieldValue}>{displayVal}</Text>
              </Text>
              {notes ? (
                <Text style={styles.fieldNotes}>💬 {notes}</Text>
              ) : null}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('onboarding.reviewTitle')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.reviewSubtitle')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {sections.map((section, index) => {
          // Check if this section has any active questions
          const hasActiveQuestions = QUIZ_QUESTIONS.some((q) => {
            if (q.section !== section.id) return false;
            if (q.showIf) return q.showIf(answers);
            return true;
          });

          if (!hasActiveQuestions && section.id !== 'debt') return null;

          return (
            <Animated.View
              key={section.id}
              entering={FadeInUp.delay(index * 60).duration(400)}
            >
              <Card style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{t(section.nameKey)}</Text>
                  <Button
                    title={t('common.edit')}
                    onPress={() => handleEditSection(section.id)}
                    variant="text"
                    style={styles.editBtn}
                  />
                </View>
                <View style={styles.divider} />
                {renderSectionContent(section.id)}
              </Card>
            </Animated.View>
          );
        })}
      </ScrollView>


      <View style={styles.footer}>
        <Button
          title="Confirm & View Essential Expenses"
          onPress={handleConfirm}
          variant="primary"
          style={styles.confirmBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmBackground,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  scrollContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  sectionCard: {
    marginBottom: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.primary,
    fontSize: 16,
  },
  editBtn: {
    paddingVertical: 0,
    height: 'auto',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  sectionFields: {
    gap: SPACING.xs,
  },
  fieldItem: {
    marginBottom: SPACING.xs,
  },
  fieldRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  fieldLabel: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  fieldValue: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  fieldNotes: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontStyle: 'italic',
    marginTop: 2,
    marginLeft: SPACING.sm,
  },
  debtsReviewList: {
    marginTop: SPACING.xs,
    paddingLeft: SPACING.sm,
    gap: 2,
  },
  debtFieldText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  confirmBtn: {
    width: '100%',
  },
});
