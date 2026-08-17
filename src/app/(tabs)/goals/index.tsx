import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Animated, { Easing, FadeIn, FadeInLeft, FadeInRight, useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppText from '../../../components/Text/AppText';
import { Button, Card, EmptyState, Input, ProgressBar } from '../../../components/ui';
import { CelebrationOverlay } from '../../../components/ui/CelebrationOverlay';
import { IncomeDatePicker } from '../../../components/ui/IncomeDatePicker';
import { GOAL_CATEGORY_KEYS, GOAL_COLOR_KEYS, GOAL_VECTOR_KEYS, GoalCategoryKey, GoalColorKey, GoalVectorKey } from '../../../constants/goals';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';
import { analyzeGoalFeasibility } from '../../../features/financial-engine/goalCalculations';
import { calculateActiveFinancialPlan } from '../../../features/financial-engine/activeFinancialPlan';
import { useTabContentBottomInset } from '../../../hooks/useTabContentBottomInset';
import { Goal, GoalPriority, GoalReminderFrequency, useGoalsStore } from '../../../store/goalsStore';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { useNotificationPreferencesStore } from '../../../store/notificationPreferencesStore';
import { useTransactionsStore } from '../../../store/transactionsStore';
import { useBillsStore } from '../../../store/billsStore';
import { ensureNotificationPermission } from '../../../services/notifications/billReminders';
import { syncGoalReminders } from '../../../services/notifications/preferenceReminders';
import { formatCurrency } from '../../../utils/currency';
import { isFutureDate, parseFinancialAmount } from '../../../utils/financialValidation';

const VECTOR_ICONS: Record<GoalVectorKey, any> = {
  shield: 'shield-checkmark-outline', umbrella: 'umbrella-outline', medical_cross: 'medkit-outline', home: 'home-outline', key: 'key-outline', car: 'car-outline', maintenance: 'construct-outline', graduation_cap: 'school-outline', book: 'book-outline', school: 'library-outline', airplane: 'airplane-outline', suitcase: 'briefcase-outline', map: 'map-outline', family: 'people-outline', gift: 'gift-outline', wallet: 'wallet-outline', piggy_bank: 'cash-outline', debt_free: 'checkmark-done-outline', target: 'locate-outline', briefcase: 'briefcase-outline', store: 'storefront-outline', laptop: 'laptop-outline', heart: 'heart-outline', celebration: 'sparkles-outline', star: 'star-outline', custom_goal: 'flag-outline',
};
const COLOR_VALUES: Record<GoalColorKey, string> = { pocket_blue: '#1858EB', deep_navy: '#101B3A', positive_lime: '#95B51D', teal: '#008F83', violet: '#7256D8', amber: '#B7791F', coral: '#C65B46', rose: '#B84F76', sky: '#367DB5', neutral: '#667085' };
const priorities: GoalPriority[] = ['essential', 'important', 'optional'];
const reminders: GoalReminderFrequency[] = ['none', 'weekly', 'monthly', 'once'];
const templates: { category: GoalCategoryKey; vectorKey: GoalVectorKey; colorKey: GoalColorKey }[] = [
  { category: 'emergency_fund', vectorKey: 'shield', colorKey: 'positive_lime' },
  { category: 'home', vectorKey: 'key', colorKey: 'pocket_blue' },
  { category: 'education', vectorKey: 'graduation_cap', colorKey: 'violet' },
  { category: 'vehicle', vectorKey: 'car', colorKey: 'teal' },
  { category: 'travel', vectorKey: 'airplane', colorKey: 'sky' },
  { category: 'debt_payoff', vectorKey: 'debt_free', colorKey: 'amber' },
];

type FormState = { id?: string; name: string; description: string; target: string; saved: string; date: string; category: GoalCategoryKey; vectorKey: GoalVectorKey; colorKey: GoalColorKey; priority: GoalPriority; reminder: GoalReminderFrequency; reminderDate: string };
const blankForm = (): FormState => ({ name: '', description: '', target: '', saved: '', date: '', category: 'other', vectorKey: 'target', colorKey: 'pocket_blue', priority: 'important', reminder: 'none', reminderDate: '' });

export default function GoalsScreen() {
  const { t, i18n } = useTranslation();
  const reduceMotion = useReducedMotion();
  const contentBottomInset = useTabContentBottomInset();
  const { answers, debts } = useOnboardingStore();
  const locale = i18n.resolvedLanguage || i18n.language || 'en';
  const currency = answers.currency || 'MAD';
  const transactions = useTransactionsStore((state) => state.transactions);
  const bills = useBillsStore((state) => state.bills);
  const today = new Date();
  const { activePeriod } = calculateActiveFinancialPlan({ answers, debts, transactions, bills, now: today });
  const capacity = Math.max(0, activePeriod.safeToSpendTotal);
  const store = useGoalsStore();
  const goalRemindersEnabled = useNotificationPreferencesStore((state) => state.goals);
  const [status, setStatus] = useState<'active' | 'completed' | 'archived'>('active');
  const [sort, setSort] = useState<'priority' | 'date' | 'progress'>('priority');
  const [category, setCategory] = useState<'all' | GoalCategoryKey>('all');
  const [form, setForm] = useState<FormState>(blankForm());
  const [step, setStep] = useState(1);
  const [stepDirection, setStepDirection] = useState<'forward' | 'backward'>('forward');
  const [editorOpen, setEditorOpen] = useState(false);
  const [contributionGoal, setContributionGoal] = useState<Goal | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionNote, setContributionNote] = useState('');
  const [editingContributionId, setEditingContributionId] = useState<string | null>(null);
  const [historyGoal, setHistoryGoal] = useState<Goal | null>(null);
  const [completedGoal, setCompletedGoal] = useState<Goal | null>(null);
  const money = (value: number) => formatCurrency(value, currency, locale);

  useEffect(() => {
    syncGoalReminders(store.goals, goalRemindersEnabled, (goal) => ({
      title: t('notifications.goalTitle', 'Goal reminder'),
      body: t('notifications.goalBody', '{{name}} is ready for a plan check.', { name: goal.name }),
    })).catch(() => undefined);
  }, [goalRemindersEnabled, store.goals, t]);

  const visibleGoals = useMemo(() => store.goals
    .filter((goal) => (status === 'active' ? goal.status === 'active' || goal.status === 'paused' : goal.status === status) && (category === 'all' || goal.category === category))
    .sort((a, b) => sort === 'date'
      ? a.targetDate.localeCompare(b.targetDate)
      : sort === 'progress'
        ? (b.alreadySaved / b.targetAmount) - (a.alreadySaved / a.targetAmount)
        : priorities.indexOf(a.classification) - priorities.indexOf(b.classification)), [category, sort, status, store.goals]);

  const openCreate = () => { setForm(blankForm()); setStep(1); setStepDirection('forward'); setEditorOpen(true); };
  const openEdit = (goal: Goal) => {
    setForm({ id: goal.id, name: goal.name, description: goal.description || '', target: String(goal.targetAmount), saved: String(goal.alreadySaved), date: goal.targetDate, category: goal.category, vectorKey: goal.vectorKey, colorKey: goal.colorKey, priority: goal.classification, reminder: goal.reminder.frequency, reminderDate: goal.reminder.date || '' });
    setStep(1); setStepDirection('forward'); setEditorOpen(true);
  };
  const changeStep = (nextStep: number) => {
    setStepDirection(nextStep > step ? 'forward' : 'backward');
    setStep(nextStep);
  };
  const stepEnter = reduceMotion
    ? FadeIn.duration(160).easing(Easing.ease)
    : (Platform.OS === 'web'
      ? FadeIn.duration(200)
      : (stepDirection === 'forward' ? FadeInRight : FadeInLeft)
        .duration(200).withInitialValues({
          opacity: 0,
          transform: [{ translateX: stepDirection === 'forward' ? 8 : -8 }],
        }))
        .easing(Easing.bezier(0.23, 1, 0.32, 1));
  const validateAndSave = async () => {
    const target = parseFinancialAmount(form.target, currency);
    const saved = parseFinancialAmount(form.saved || '0', currency);
    const error = !form.name.trim() ? t('goals.validation.title') : !target || target <= 0 ? t('goals.validation.target') : saved === null || saved < 0 ? t('goals.validation.saved') : !isFutureDate(form.date) ? t('goals.validation.date') : form.reminder === 'once' && !isFutureDate(form.reminderDate) ? t('goals.reminderDateValidation') : null;
    if (error) return Alert.alert(t('common.error', 'Error'), error);
    const values = { name: form.name.trim(), description: form.description.trim() || undefined, targetAmount: target!, alreadySaved: saved!, targetDate: form.date, isEssential: form.priority === 'essential', classification: form.priority, category: form.category, vectorKey: form.vectorKey, colorKey: form.colorKey, reminder: { frequency: form.reminder, date: form.reminder === 'once' ? form.reminderDate : undefined } };
    if (form.reminder !== 'none') await ensureNotificationPermission().catch(() => false);
    if (form.id) store.updateGoal(form.id, values); else store.addGoal(values);
    setEditorOpen(false);
  };
  const contribute = () => {
    if (!contributionGoal) return;
    const amount = parseFinancialAmount(contributionAmount, currency);
    if (!amount || amount <= 0) return Alert.alert(t('common.error', 'Error'), t('goals.validation.contribution'));
    const wasCompleted = contributionGoal.status === 'completed';
    if (editingContributionId) store.updateContribution(editingContributionId, amount, undefined, contributionNote);
    else store.addContribution(contributionGoal.id, amount, undefined, contributionNote, `${contributionGoal.id}-${Date.now()}`);
    const updated = useGoalsStore.getState().goals.find((item) => item.id === contributionGoal.id);
    setContributionGoal(null); setContributionAmount(''); setContributionNote(''); setEditingContributionId(null);
    if (!wasCompleted && updated?.status === 'completed' && !updated.celebrationShownAt) {
      store.markCelebrationShown(updated.id);
      setCompletedGoal(updated);
    }
  };
  const removeGoal = (goal: Goal) => Alert.alert(t('goals.delete'), t('goals.deleteConfirm'), [{ text: t('common.cancel', 'Cancel'), style: 'cancel' }, { text: t('goals.delete'), style: 'destructive', onPress: () => store.deleteGoal(goal.id) }]);
  const completeGoal = (goal: Goal) => Alert.alert(t('goals.markComplete'), t('goals.completeConfirm'), [{ text: t('common.cancel', 'Cancel'), style: 'cancel' }, { text: t('goals.markComplete'), onPress: () => { store.setGoalStatus(goal.id, 'completed'); const updated = useGoalsStore.getState().goals.find((item) => item.id === goal.id); if (updated && !updated.celebrationShownAt) { store.markCelebrationShown(goal.id); setCompletedGoal(updated); } } }]);
  const showHistory = (goal: Goal) => {
    setHistoryGoal(goal);
  };

  return <SafeAreaView style={styles.screen}>
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: contentBottomInset }]}>
      <View style={styles.header}><AppText variant="headlineMd" role="heading" aria-level={1}>{t('goals.title')}</AppText><Button title={t('goals.add')} onPress={openCreate} style={styles.headerButton} /></View>
      <View style={styles.chips}>{(['active', 'completed', 'archived'] as const).map((item) => <Chip key={item} active={status === item} label={t(`goals.${item}`)} onPress={() => setStatus(item)} />)}</View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}><Chip active={category === 'all'} label={t('goals.allCategories')} onPress={() => setCategory('all')} />{GOAL_CATEGORY_KEYS.map((item) => <Chip key={item} active={category === item} label={t(`goals.categories.${item}`)} onPress={() => setCategory(item)} />)}</ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{(['priority', 'date', 'progress'] as const).map((item) => <Chip key={item} active={sort === item} label={t(`goals.sort.${item}`)} onPress={() => setSort(item)} />)}</ScrollView>
      {visibleGoals.length === 0 ? <EmptyState icon="flag-outline" title={t('goals.empty')} description={t('goals.empty')} actionLabel={t('goals.add')} onAction={openCreate} /> : visibleGoals.map((goal) => {
        const progress = goal.targetAmount > 0 ? Math.min(1, Math.max(0, goal.alreadySaved / goal.targetAmount)) : 0;
        const analysis = analyzeGoalFeasibility(goal, capacity, goal.status);
        const date = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${goal.targetDate}T12:00:00`));
        return <Card key={goal.id} style={[styles.goalCard, { borderColor: COLOR_VALUES[goal.colorKey] }]}>
          <View style={styles.goalHeader}><View style={[styles.iconBox, { backgroundColor: `${COLOR_VALUES[goal.colorKey]}22` }]}><Ionicons name={VECTOR_ICONS[goal.vectorKey]} size={26} color={COLOR_VALUES[goal.colorKey]} accessible accessibilityLabel={t(`goals.categories.${goal.category}`)} /></View><View style={styles.grow}><AppText variant="cardTitle">{goal.name}</AppText><AppText variant="caption">{t(`goals.categories.${goal.category}`)} · {t(`goals.priorities.${goal.classification}`)}</AppText></View><Pressable onPress={() => openEdit(goal)} style={styles.touch} accessibilityRole="button" accessibilityLabel={t('goals.edit')}><Ionicons name="create-outline" size={22} color={COLORS.surfaceTint} /></Pressable></View>
          <AppText variant="bodySemiBold">{t('goals.savedOf', { saved: money(goal.alreadySaved), target: money(goal.targetAmount) })}</AppText>
          <ProgressBar progress={progress} /><AppText variant="caption" accessibilityLabel={`${Math.round(progress * 100)}%`}>{Math.round(progress * 100)}% · {t('goals.due', { date })}</AppText>
          <View style={styles.statusRow}><AppText variant="labelSm" style={{ color: COLOR_VALUES[goal.colorKey] }}>{t(`goals.statuses.${analysis.status}`)}</AppText><AppText variant="caption">{t('goals.requiredMonthly', { amount: money(analysis.requiredMonthlyContribution) })}</AppText></View>
          <View style={styles.actions}>{goal.status !== 'completed' && <Button title={t('goals.contribution')} onPress={() => setContributionGoal(goal)} style={styles.flexButton} />}<Button title={t('goals.history')} variant="secondary" onPress={() => showHistory(goal)} style={styles.flexButton} /></View>
          <View style={styles.actions}>{goal.status !== 'completed' && <Button title={t('goals.markComplete')} variant="text" onPress={() => completeGoal(goal)} style={styles.flexButton} />}<Button title={goal.status === 'paused' ? t('goals.resume') : t('goals.pause')} variant="text" onPress={() => store.setGoalStatus(goal.id, goal.status === 'paused' ? 'active' : 'paused')} style={styles.flexButton} /><Button title={t('goals.archive')} variant="text" onPress={() => store.setGoalStatus(goal.id, 'archived')} style={styles.flexButton} /><Button title={t('goals.delete')} variant="text" onPress={() => removeGoal(goal)} style={styles.flexButton} /></View>
        </Card>;
      })}
    </ScrollView>

    <Modal visible={editorOpen} animationType={reduceMotion ? 'fade' : 'slide'} onRequestClose={() => setEditorOpen(false)}><SafeAreaView style={styles.screen}><ScrollView contentContainerStyle={styles.modalContent}><AppText variant="sectionTitle" role="heading">{form.id ? t('goals.edit') : t('goals.add')}</AppText><AppText variant="caption">{step}/4</AppText>
      <Animated.View key={step} entering={stepEnter} style={{ gap: SPACING.md }}>
      {step === 1 && <><AppText variant="bodySemiBold">{t('goals.chooseCategory')}</AppText><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{templates.map((item) => <Chip key={item.category} active={form.category === item.category} label={t(`goals.categories.${item.category}`)} onPress={() => setForm({ ...form, name: t(`goals.categories.${item.category}`), category: item.category, vectorKey: item.vectorKey, colorKey: item.colorKey })} />)}</ScrollView><View style={styles.grid}>{GOAL_CATEGORY_KEYS.map((key) => <Picker key={key} active={form.category === key} label={t(`goals.categories.${key}`)} onPress={() => setForm({ ...form, category: key })} />)}</View></>}
      {step === 2 && <><AppText variant="bodySemiBold">{t('goals.chooseStyle')}</AppText><View style={styles.iconGrid}>{GOAL_VECTOR_KEYS.map((key) => <Pressable key={key} onPress={() => setForm({ ...form, vectorKey: key })} style={[styles.vectorChoice, form.vectorKey === key && styles.selected]} accessibilityRole="radio" accessibilityState={{ checked: form.vectorKey === key }}><Ionicons name={VECTOR_ICONS[key]} size={25} color={COLOR_VALUES[form.colorKey]} /><AppText variant="caption">{t(`goals.vectors.${key}`)}</AppText></Pressable>)}</View><View style={styles.colorGrid}>{GOAL_COLOR_KEYS.map((key) => <Pressable key={key} onPress={() => setForm({ ...form, colorKey: key })} style={[styles.colorChoice, { backgroundColor: COLOR_VALUES[key] }, form.colorKey === key && styles.colorSelected]} accessibilityRole="radio" accessibilityLabel={t(`goals.colors.${key}`)} />)}</View></>}
      {step === 3 && <><AppText variant="bodySemiBold">{t('goals.enterDetails')}</AppText><Input label={t('goals.name')} value={form.name} onChangeText={(name) => setForm({ ...form, name })} /><Input label={t('goals.description')} value={form.description} onChangeText={(description) => setForm({ ...form, description })} multiline /><Input label={`${t('goals.target')} (${currency})`} value={form.target} onChangeText={(target) => setForm({ ...form, target })} keyboardType="decimal-pad" /><Input label={`${t('goals.saved')} (${currency})`} value={form.saved} onChangeText={(saved) => setForm({ ...form, saved })} keyboardType="decimal-pad" /><IncomeDatePicker value={form.date} locale={locale} label={t('goals.date')} onChange={(date) => setForm({ ...form, date })} /></>}
      {step === 4 && <><AppText variant="bodySemiBold">{t('goals.review')}</AppText><AppText variant="inputLabel">{t('goals.priority')}</AppText><View style={styles.chips}>{priorities.map((key) => <Chip key={key} active={form.priority === key} label={t(`goals.priorities.${key}`)} onPress={() => setForm({ ...form, priority: key })} />)}</View><AppText variant="inputLabel">{t('goals.reminder')}</AppText><View style={styles.chips}>{reminders.map((key) => <Chip key={key} active={form.reminder === key} label={t(key === 'none' ? 'goals.noReminder' : `goals.${key}`)} onPress={() => setForm({ ...form, reminder: key })} />)}</View>{form.reminder === 'once' && <IncomeDatePicker value={form.reminderDate} locale={locale} label={t('goals.reminderDate')} onChange={(reminderDate) => setForm({ ...form, reminderDate })} />}</>}
      </Animated.View>
      <View style={styles.actions}>{step > 1 && <Button title={t('goals.back')} variant="secondary" onPress={() => changeStep(step - 1)} style={styles.flexButton} />}{step < 4 ? <Button title={t('goals.next')} onPress={() => changeStep(step + 1)} style={styles.flexButton} /> : <Button title={form.id ? t('goals.update') : t('goals.save')} onPress={validateAndSave} style={styles.flexButton} />}</View><Button title={t('common.cancel', 'Cancel')} variant="text" onPress={() => setEditorOpen(false)} /></ScrollView></SafeAreaView></Modal>

    <Modal visible={Boolean(contributionGoal)} transparent animationType="fade" onRequestClose={() => setContributionGoal(null)}><View style={styles.overlay}><Card style={styles.dialog}><AppText variant="sectionTitle">{t('goals.contribution')}</AppText><Input label={`${t('goals.contributionAmount')} (${currency})`} value={contributionAmount} onChangeText={setContributionAmount} keyboardType="decimal-pad" /><Input label={t('goals.contributionNote')} value={contributionNote} onChangeText={setContributionNote} /><View style={styles.actions}><Button title={t('common.cancel', 'Cancel')} variant="secondary" onPress={() => setContributionGoal(null)} style={styles.flexButton} /><Button title={t('common.add', 'Add')} onPress={contribute} style={styles.flexButton} /></View></Card></View></Modal>

    <Modal visible={Boolean(historyGoal)} animationType={reduceMotion ? 'fade' : 'slide'} onRequestClose={() => setHistoryGoal(null)}><SafeAreaView style={styles.screen}><ScrollView contentContainerStyle={styles.modalContent}><AppText variant="sectionTitle" role="heading">{t('goals.history')}</AppText>{store.contributions.filter((item) => item.goalId === historyGoal?.id).sort((a, b) => b.contributionDate.localeCompare(a.contributionDate)).map((item) => <Card key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}><View style={styles.grow}><AppText variant="bodySemiBold">{money(item.amount)}</AppText><AppText variant="caption">{new Intl.DateTimeFormat(locale).format(new Date(`${item.contributionDate}T12:00:00`))}{item.note ? ` · ${item.note}` : ''}</AppText></View><Pressable style={styles.touch} onPress={() => { setEditingContributionId(item.id); setContributionAmount(String(item.amount)); setContributionNote(item.note || ''); setContributionGoal(historyGoal); setHistoryGoal(null); }} accessibilityRole="button" accessibilityLabel={t('goals.editContribution')}><Ionicons name="create-outline" size={22} color={COLORS.surfaceTint} /></Pressable><Pressable style={styles.touch} onPress={() => store.deleteContribution(item.id)} accessibilityRole="button" accessibilityLabel={t('goals.deleteContribution')}><Ionicons name="trash-outline" size={22} color={COLORS.error} /></Pressable></Card>)}{!store.contributions.some((item) => item.goalId === historyGoal?.id) && <AppText variant="body">{t('goals.noHistory')}</AppText>}<Button title={t('common.close', 'Close')} onPress={() => setHistoryGoal(null)} /></ScrollView></SafeAreaView></Modal>

    <Modal visible={Boolean(completedGoal)} transparent animationType="fade"><View style={styles.overlay} accessibilityLiveRegion="assertive"><Card style={styles.dialog}><Ionicons name={VECTOR_ICONS[completedGoal?.vectorKey || 'target']} size={48} color={COLOR_VALUES[completedGoal?.colorKey || 'pocket_blue']} /><AppText variant="sectionTitle" role="heading">{t('goals.completedTitle')}</AppText><AppText variant="body">{t('goals.completedBody', { amount: money(completedGoal?.targetAmount || 0) })}</AppText><Button title={t('goals.createAnother')} onPress={() => { setCompletedGoal(null); openCreate(); }} /><Button title={t('goals.returnGoals')} variant="secondary" onPress={() => setCompletedGoal(null)} /></Card></View></Modal>
    <CelebrationOverlay active={Boolean(completedGoal) && !reduceMotion} onComplete={() => undefined} />
  </SafeAreaView>;
}

function Chip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.chip, active && styles.selected]} accessibilityRole="radio" accessibilityState={{ checked: active }}><AppText variant="labelSm">{label}</AppText></Pressable>; }
function Picker({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.picker, active && styles.selected]} accessibilityRole="radio" accessibilityState={{ checked: active }}><AppText variant="bodyMedium">{label}</AppText></Pressable>; }

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: COLORS.surface }, content: { padding: SPACING.lg, gap: SPACING.md }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.sm }, headerButton: { minHeight: 44 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs }, chip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: COLORS.outlineVariant, borderRadius: RADIUS.round }, selected: { borderColor: COLORS.surfaceTint, backgroundColor: COLORS.primaryFixed }, goalCard: { gap: SPACING.sm, borderWidth: 1 }, goalHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }, iconBox: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.md }, grow: { flex: 1 }, touch: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, statusRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: SPACING.xs }, actions: { flexDirection: 'row', gap: SPACING.xs }, flexButton: { flex: 1, minHeight: 44 }, modalContent: { padding: SPACING.lg, gap: SPACING.md }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs }, picker: { width: '48%', minHeight: 52, justifyContent: 'center', padding: SPACING.sm, borderWidth: 1, borderColor: COLORS.outlineVariant, borderRadius: RADIUS.md }, iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs }, vectorChoice: { width: 88, minHeight: 72, alignItems: 'center', justifyContent: 'center', padding: SPACING.xs, borderWidth: 1, borderColor: COLORS.outlineVariant, borderRadius: RADIUS.md }, colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }, colorChoice: { width: 48, height: 48, borderRadius: 24 }, colorSelected: { borderWidth: 4, borderColor: COLORS.textPrimary }, overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,.45)', justifyContent: 'center', padding: SPACING.lg }, dialog: { gap: SPACING.md, alignItems: 'stretch' } });
