import { describe, expect, test } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { getTabContentBottomInset, TAB_BAR_BASE_HEIGHT, TAB_CENTER_OVERLAP } from '../utils/tabLayout';
import { getAnnualProjectionLabelKey } from '../utils/planPresentation';
import { minimumOnboardingTranslations } from '../constants/translations/minimumOnboarding';
import { planDetailsTranslations } from '../constants/translations/planDetails';
import en from '../constants/translations/en.json';
import fr from '../constants/translations/fr.json';
import ar from '../constants/translations/ar.json';

const source = (path: string) => readFileSync(resolve(__dirname, '..', path), 'utf8');

describe('focused UX corrections', () => {
  test('places the safe-to-spend result before expandable optional setup', () => {
    const dashboard = source('app/(tabs)/dashboard/index.tsx');
    const progressiveSetup = source('components/dashboard/DashboardProgressiveSetup.tsx');
    const balanceIndex = dashboard.indexOf('styles.balanceCard') !== -1 ? dashboard.indexOf('styles.balanceCard') : dashboard.indexOf('DashboardBalanceCard');
    const setupIndex = dashboard.indexOf('styles.progressiveSetup') !== -1 ? dashboard.indexOf('styles.progressiveSetup') : dashboard.indexOf('DashboardProgressiveSetup');
    expect(balanceIndex).toBeLessThan(setupIndex);
    expect(progressiveSetup).toContain('accessibilityState={{ expanded: setupExpanded }}');
    expect(progressiveSetup).toContain('setupExpanded && (');
    expect(progressiveSetup).toContain('nextSetup.map((item) => (');
  });

  test('uses one safe bottom inset that includes navigation, centre overlap, device inset, and spacing', () => {
    expect(getTabContentBottomInset(20)).toBeGreaterThan(TAB_BAR_BASE_HEIGHT + TAB_CENTER_OVERLAP + 20);
    ['dashboard/index.tsx', 'plan/index.tsx', 'transactions/index.tsx', 'profile/index.tsx', 'goals/index.tsx'].forEach((screen) => {
      expect(source(`app/(tabs)/${screen}`)).toContain('contentBottomInset');
    });
  });

  test('keeps transaction list actions singular and opens a root-stack form', () => {
    const transactions = source('app/(tabs)/transactions/index.tsx');
    const form = source('app/transaction-form.tsx');
    expect(transactions).not.toContain('showForm');
    expect(transactions).toContain("storedTransactions.length > 0");
    expect(transactions).toContain("router.push('/transaction-form')");
    expect(transactions).toContain('leadingIcon={<Ionicons name="search"');
    expect(transactions).toContain('chipScrollRef.current?.scrollTo');
    ['shopping-basket', 'payments', 'local-gas-station', 'medical-services']
      .forEach((invalidIcon) => expect(transactions).not.toContain(`'${invalidIcon}'`));
    expect(form).toContain('KeyboardAvoidingView');
    expect(form).toContain('Keyboard.isVisible()');
    expect(form).toContain('TextInput.State.currentlyFocusedInput()');
    expect(form).toContain('SafeAreaView');
    expect(source('app/_layout.tsx')).toContain('<Stack.Screen name="transaction-form" />');
  });

  test('dismisses the Android keyboard without navigating away from an active form', () => {
    const input = source('components/ui/Input.tsx');
    expect(input).toContain("BackHandler.addEventListener('hardwareBackPress'");
    expect(input).toContain('Keyboard.dismiss()');
    expect(input).toContain("returnKeyType={multiline ? 'default' : 'done'}");
  });

  test('does not process a live Android photo-picker result twice', () => {
    const editProfile = source('app/profile/edit.tsx');
    expect(editProfile).toContain('const launchedPhotoPicker = useRef(false);');
    expect(editProfile).toContain('launchedPhotoPicker.current = true;');
    expect(editProfile).toContain('|| launchedPhotoPicker.current');
  });

  test('lets users correct an existing debt without deleting it first', () => {
    const debts = source('app/debts/index.tsx');
    expect(debts).toContain('handleEditDebt');
    expect(debts).toContain('updateDebt(editingDebtIndex, newDebt)');
    expect(debts).toContain('accessibilityLabel="Edit debt account"');
    expect(debts).toContain("'Update Debt Account'");
  });

  test('renders five real quick actions and no fake sixth action', () => {
    const tabs = source('app/(tabs)/_layout.tsx');
    const labels = ['addExpense', 'addIncome', 'addBill', 'addDebt', 'addGoal'];
    labels.forEach((label) => expect(tabs).toContain(`tabs.${label}`));
    expect(tabs).not.toContain('sixth');
    expect(tabs).toContain('styles.sheetButtonWide');
    expect(tabs).toContain('styles.cancelAction');
  });

  test('selects annual surplus and shortfall copy from the value without a plus prefix', () => {
    expect(getAnnualProjectionLabelKey(1)).toBe('planDetails.projectionRemainder');
    expect(getAnnualProjectionLabelKey(-1)).toBe('planDetails.projectionShortfall');
    expect(source('app/(tabs)/plan/index.tsx')).not.toContain("annualProjection > 0 ? '+'");
  });

  test('includes correction copy in English, French, and Arabic', () => {
    [minimumOnboardingTranslations.en, minimumOnboardingTranslations.fr, minimumOnboardingTranslations.ar]
      .forEach(({ progressive }) => expect(progressive).toMatchObject({ expand: expect.any(String), collapse: expect.any(String) }));
    [planDetailsTranslations.en, planDetailsTranslations.fr, planDetailsTranslations.ar]
      .forEach((translations) => expect(translations).toMatchObject({ projectionRemainder: expect.any(String), projectionShortfall: expect.any(String) }));
    [en, fr, ar].forEach(({ transactions }) => expect(transactions).toMatchObject({ clearSearch: expect.any(String), discardTitle: expect.any(String) }));
  });

  test('logs out to authentication and shows a one-time welcome on return', () => {
    const profile = source('app/(tabs)/profile/index.tsx');
    const layout = source('app/_layout.tsx');
    expect(profile).toContain("AsyncStorage.setItem('pocket-ahead-welcome-back', 'true')");
    expect(profile).toContain("router.replace('/auth')");
    expect(layout).toContain("AsyncStorage.removeItem('pocket-ahead-welcome-back')");
    expect(layout).toContain("dashboard.welcomeBack");
  });
});
