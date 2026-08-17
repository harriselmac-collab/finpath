import { z } from 'zod';
import { SUPPORTED_CURRENCIES } from '../../constants/currencies';
import { SUPPORTED_LANGUAGES } from '../../services/localization/languages';

export interface QuestionOption {
  value: string;
  labelKey: string;
}

export interface QuestionConfig {
  id: string;
  section: string;
  titleKey: string;
  subtitleKey: string;
  type: 'text' | 'select' | 'currency' | 'number' | 'date' | 'yes-no' | 'debts-list';
  options?: QuestionOption[];
  placeholder?: string;
  required?: boolean;
  showIf?: (answers: Record<string, any>) => boolean;
}

export const QUIZ_QUESTIONS: QuestionConfig[] = [
  {
    id: 'language', section: 'localization', titleKey: 'onboarding.minimum.language.title',
    subtitleKey: 'onboarding.minimum.language.subtitle', type: 'select', required: true,
    options: SUPPORTED_LANGUAGES.map(({ key, label }) => ({ value: key, labelKey: label })),
  },
  {
    id: 'currency', section: 'localization', titleKey: 'onboarding.minimum.currency.title',
    subtitleKey: 'onboarding.minimum.currency.subtitle', type: 'select', required: true,
    options: SUPPORTED_CURRENCIES.map(({ code, name }) => ({ value: code, labelKey: name })),
  },
  {
    id: 'availableBalance', section: 'essentials', titleKey: 'onboarding.minimum.available.title',
    subtitleKey: 'onboarding.minimum.available.subtitle', type: 'currency', required: true,
  },
  {
    id: 'incomeFrequency', section: 'essentials', titleKey: 'onboarding.minimum.frequency.title',
    subtitleKey: 'onboarding.minimum.frequency.subtitle', type: 'select', required: true,
    options: ['weekly', 'everyTwoWeeks', 'twiceMonthly', 'monthly', 'irregular', 'oneTime']
      .map((value) => ({ value, labelKey: `onboarding.minimum.frequency.${value}` })),
  },
  {
    id: 'payday', section: 'essentials', titleKey: 'onboarding.minimum.payday.title',
    subtitleKey: 'onboarding.minimum.payday.subtitle', type: 'number', required: true,
    showIf: (answers) => answers.incomeFrequency === 'monthly',
  },
  {
    id: 'firstPayday', section: 'essentials', titleKey: 'onboarding.minimum.twiceMonthly.firstTitle',
    subtitleKey: 'onboarding.minimum.twiceMonthly.subtitle', type: 'number', required: true,
    showIf: (answers) => answers.incomeFrequency === 'twiceMonthly',
  },
  {
    id: 'secondPayday', section: 'essentials', titleKey: 'onboarding.minimum.twiceMonthly.secondTitle',
    subtitleKey: 'onboarding.minimum.twiceMonthly.subtitle', type: 'number', required: true,
    showIf: (answers) => answers.incomeFrequency === 'twiceMonthly',
  },
  {
    id: 'incomeDateCertainty', section: 'essentials', titleKey: 'onboarding.minimum.certainty.title',
    subtitleKey: 'onboarding.minimum.certainty.subtitle', type: 'select', required: true,
    options: ['exact', 'approximate', 'notSure']
      .map((value) => ({ value, labelKey: `onboarding.minimum.certainty.${value}` })),
    showIf: (answers) => ['irregular', 'oneTime'].includes(answers.incomeFrequency),
  },
  {
    id: 'nextIncomeDate', section: 'essentials', titleKey: 'onboarding.minimum.nextIncomeDate.title',
    subtitleKey: 'onboarding.minimum.nextIncomeDate.subtitle', type: 'date', required: true,
    showIf: (answers) => ['weekly', 'everyTwoWeeks'].includes(answers.incomeFrequency)
      || ['exact', 'approximate'].includes(answers.incomeDateCertainty),
  },
  {
    id: 'mainIncome', section: 'essentials', titleKey: 'onboarding.minimum.income.title',
    subtitleKey: 'onboarding.minimum.income.subtitle', type: 'currency', required: true,
  },
  {
    id: 'essentialBillsDue', section: 'essentials', titleKey: 'onboarding.minimum.bills.title',
    subtitleKey: 'onboarding.minimum.bills.subtitle', type: 'currency', required: true,
  },
  {
    id: 'debtMinimumDue', section: 'essentials', titleKey: 'onboarding.minimum.debt.title',
    subtitleKey: 'onboarding.minimum.debt.subtitle', type: 'currency', required: true,
  },
  {
    id: 'upcomingFlexibleSpending', section: 'essentials', titleKey: 'onboarding.minimum.flexible.title',
    subtitleKey: 'onboarding.minimum.flexible.subtitle', type: 'currency', required: true,
  },
  {
    id: 'overdueCommitments', section: 'essentials', titleKey: 'onboarding.minimum.overdue.title',
    subtitleKey: 'onboarding.minimum.overdue.subtitle', type: 'yes-no', required: true,
  },
  {
    id: 'protectedBuffer', section: 'essentials', titleKey: 'onboarding.minimum.buffer.title',
    subtitleKey: 'onboarding.minimum.buffer.subtitle', type: 'currency', required: false,
  },
  {
    id: 'savingsGoalAmount', section: 'essentials', titleKey: 'onboarding.minimum.goal.title',
    subtitleKey: 'onboarding.minimum.goal.subtitle', type: 'currency', required: false,
  },
  {
    id: 'annualExpenseDue', section: 'essentials', titleKey: 'onboarding.minimum.annual.title',
    subtitleKey: 'onboarding.minimum.annual.subtitle', type: 'currency', required: false,
  },
  {
    id: 'reminderPreference', section: 'essentials', titleKey: 'onboarding.minimum.reminder.title',
    subtitleKey: 'onboarding.minimum.reminder.subtitle', type: 'select', required: false,
    options: ['dueDates', 'weekly', 'none']
      .map((value) => ({ value, labelKey: `onboarding.minimum.reminder.${value}` })),
  },
];

export const PROGRESSIVE_PROFILE_QUESTIONS: QuestionConfig[] = [
  // SECTION: Personal Profile
  {
    id: 'preferredName',
    section: 'personal',
    titleKey: 'onboarding.questions.preferredName.title',
    subtitleKey: 'onboarding.questions.preferredName.subtitle',
    type: 'text',
    required: true,
    placeholder: 'e.g. Hamza',
  },
  {
    id: 'country',
    section: 'personal',
    titleKey: 'onboarding.questions.country.title',
    subtitleKey: 'onboarding.questions.country.subtitle',
    type: 'select',
    required: true,
    options: [
      { value: 'Morocco', labelKey: 'Morocco' },
      { value: 'France', labelKey: 'France' },
      { value: 'United States', labelKey: 'United States' },
      { value: 'Other', labelKey: 'Other' },
    ],
  },
  {
    id: 'city',
    section: 'personal',
    titleKey: 'onboarding.questions.city.title',
    subtitleKey: 'onboarding.questions.city.subtitle',
    type: 'text',
    required: true,
    placeholder: 'e.g. Casablanca',
  },
  {
    id: 'currency',
    section: 'personal',
    titleKey: 'onboarding.questions.currency.title',
    subtitleKey: 'onboarding.questions.currency.subtitle',
    type: 'select',
    required: true,
    options: SUPPORTED_CURRENCIES.map(({ code, name }) => ({ value: code, labelKey: name })),
  },
  {
    id: 'ageRange',
    section: 'personal',
    titleKey: 'onboarding.questions.ageRange.title',
    subtitleKey: 'onboarding.questions.ageRange.subtitle',
    type: 'select',
    required: true,
    options: [
      { value: '18-25', labelKey: '18 - 25' },
      { value: '26-35', labelKey: '26 - 35' },
      { value: '36-50', labelKey: '36 - 50' },
      { value: '51+', labelKey: '51+' },
    ],
  },
  {
    id: 'employmentStatus',
    section: 'personal',
    titleKey: 'onboarding.questions.employmentStatus.title',
    subtitleKey: 'onboarding.questions.employmentStatus.subtitle',
    type: 'select',
    required: true,
    options: [
      { value: 'employed', labelKey: 'Employed' },
      { value: 'self-employed', labelKey: 'Self-employed' },
      { value: 'unemployed', labelKey: 'Unemployed' },
      { value: 'retired', labelKey: 'Retired' },
    ],
  },

  // SECTION: Income
  {
    id: 'hasIncome',
    section: 'income',
    titleKey: 'onboarding.questions.hasIncome.title',
    subtitleKey: 'onboarding.questions.hasIncome.subtitle',
    type: 'yes-no',
    required: true,
  },
  {
    id: 'mainIncome',
    section: 'income',
    titleKey: 'onboarding.questions.mainIncome.title',
    subtitleKey: 'onboarding.questions.mainIncome.subtitle',
    type: 'currency',
    required: true,
    showIf: (answers) => answers.hasIncome === true,
  },
  {
    id: 'incomeFrequency',
    section: 'income',
    titleKey: 'onboarding.questions.incomeFrequency.title',
    subtitleKey: 'onboarding.questions.incomeFrequency.subtitle',
    type: 'select',
    required: true,
    options: [
      { value: 'monthly', labelKey: 'Monthly' },
      { value: 'weekly', labelKey: 'Weekly' },
      { value: 'bi-weekly', labelKey: 'Bi-weekly' },
      { value: 'irregular', labelKey: 'Irregular' },
    ],
    showIf: (answers) => answers.hasIncome === true,
  },
  {
    id: 'incomeType',
    section: 'income',
    titleKey: 'onboarding.questions.incomeType.title',
    subtitleKey: 'onboarding.questions.incomeType.subtitle',
    type: 'select',
    required: true,
    options: [
      { value: 'fixed', labelKey: 'Fixed' },
      { value: 'irregular', labelKey: 'Irregular' },
    ],
    showIf: (answers) => answers.hasIncome === true,
  },
  {
    id: 'nextIncomeDate',
    section: 'income',
    titleKey: 'onboarding.questions.nextIncomeDate.title',
    subtitleKey: 'onboarding.questions.nextIncomeDate.subtitle',
    type: 'date',
    required: true,
    showIf: (answers) => answers.hasIncome === true,
  },
  {
    id: 'hasSecondIncome',
    section: 'income',
    titleKey: 'onboarding.questions.hasSecondIncome.title',
    subtitleKey: 'onboarding.questions.hasSecondIncome.subtitle',
    type: 'yes-no',
    required: true,
    showIf: (answers) => answers.hasIncome === true,
  },
  {
    id: 'secondIncome',
    section: 'income',
    titleKey: 'onboarding.questions.secondIncome.title',
    subtitleKey: 'onboarding.questions.secondIncome.subtitle',
    type: 'currency',
    required: true,
    showIf: (answers) => answers.hasIncome === true && answers.hasSecondIncome === true,
  },
  {
    id: 'secondIncomeSource',
    section: 'income',
    titleKey: 'onboarding.questions.secondIncomeSource.title',
    subtitleKey: 'onboarding.questions.secondIncomeSource.subtitle',
    type: 'text',
    required: false,
    placeholder: 'e.g. Freelance design',
    showIf: (answers) => answers.hasIncome === true && answers.hasSecondIncome === true,
  },

  // SECTION: Housing
  {
    id: 'hasRent',
    section: 'housing',
    titleKey: 'onboarding.questions.hasRent.title',
    subtitleKey: 'onboarding.questions.hasRent.subtitle',
    type: 'yes-no',
    required: true,
  },
  {
    id: 'hasMortgage',
    section: 'housing',
    titleKey: 'onboarding.questions.hasMortgage.title',
    subtitleKey: 'onboarding.questions.hasMortgage.subtitle',
    type: 'yes-no',
    required: true,
    showIf: (answers) => answers.hasRent === false,
  },
  {
    id: 'housingAmount',
    section: 'housing',
    titleKey: 'onboarding.questions.housingAmount.title',
    subtitleKey: 'onboarding.questions.housingAmount.subtitle',
    type: 'currency',
    required: true,
    showIf: (answers) => answers.hasRent === true || answers.hasMortgage === true,
  },
  {
    id: 'shareHousing',
    section: 'housing',
    titleKey: 'onboarding.questions.shareHousing.title',
    subtitleKey: 'onboarding.questions.shareHousing.subtitle',
    type: 'yes-no',
    required: true,
    showIf: (answers) => answers.hasRent === true || answers.hasMortgage === true,
  },
  {
    id: 'supportOtherHousehold',
    section: 'housing',
    titleKey: 'onboarding.questions.supportOtherHousehold.title',
    subtitleKey: 'onboarding.questions.supportOtherHousehold.subtitle',
    type: 'yes-no',
    required: true,
  },

  // SECTION: Family
  {
    id: 'isMarried',
    section: 'family',
    titleKey: 'onboarding.questions.isMarried.title',
    subtitleKey: 'onboarding.questions.isMarried.subtitle',
    type: 'yes-no',
    required: true,
  },
  {
    id: 'hasChildren',
    section: 'family',
    titleKey: 'onboarding.questions.hasChildren.title',
    subtitleKey: 'onboarding.questions.hasChildren.subtitle',
    type: 'yes-no',
    required: true,
  },
  {
    id: 'numChildren',
    section: 'family',
    titleKey: 'onboarding.questions.numChildren.title',
    subtitleKey: 'onboarding.questions.numChildren.subtitle',
    type: 'number',
    required: true,
    showIf: (answers) => answers.hasChildren === true,
  },
  {
    id: 'schoolFees',
    section: 'family',
    titleKey: 'onboarding.questions.schoolFees.title',
    subtitleKey: 'onboarding.questions.schoolFees.subtitle',
    type: 'currency',
    required: false,
    showIf: (answers) => answers.hasChildren === true,
  },
  {
    id: 'childcareExpenses',
    section: 'family',
    titleKey: 'onboarding.questions.childcareExpenses.title',
    subtitleKey: 'onboarding.questions.childcareExpenses.subtitle',
    type: 'currency',
    required: false,
    showIf: (answers) => answers.hasChildren === true,
  },
  {
    id: 'supportRelatives',
    section: 'family',
    titleKey: 'onboarding.questions.supportRelatives.title',
    subtitleKey: 'onboarding.questions.supportRelatives.subtitle',
    type: 'yes-no',
    required: true,
  },

  // SECTION: Vehicle
  {
    id: 'hasVehicle',
    section: 'vehicle',
    titleKey: 'onboarding.questions.hasVehicle.title',
    subtitleKey: 'onboarding.questions.hasVehicle.subtitle',
    type: 'select',
    required: true,
    options: [
      { value: 'yes', labelKey: 'Yes, I do' },
      { value: 'no', labelKey: 'No, I do not' },
      { value: 'not-sure', labelKey: 'Not sure' },
    ],
  },
  {
    id: 'vehicleFinancing',
    section: 'vehicle',
    titleKey: 'onboarding.questions.vehicleFinancing.title',
    subtitleKey: 'onboarding.questions.vehicleFinancing.subtitle',
    type: 'yes-no',
    required: true,
    showIf: (answers) => answers.hasVehicle === 'yes',
  },
  {
    id: 'vehiclePayment',
    section: 'vehicle',
    titleKey: 'onboarding.questions.vehiclePayment.title',
    subtitleKey: 'onboarding.questions.vehiclePayment.subtitle',
    type: 'currency',
    required: true,
    showIf: (answers) => answers.hasVehicle === 'yes' && answers.vehicleFinancing === true,
  },
  {
    id: 'fuelSpending',
    section: 'vehicle',
    titleKey: 'onboarding.questions.fuelSpending.title',
    subtitleKey: 'onboarding.questions.fuelSpending.subtitle',
    type: 'currency',
    required: true,
    showIf: (answers) => answers.hasVehicle === 'yes',
  },
  {
    id: 'vehicleInsurance',
    section: 'vehicle',
    titleKey: 'onboarding.questions.vehicleInsurance.title',
    subtitleKey: 'onboarding.questions.vehicleInsurance.subtitle',
    type: 'yes-no',
    required: true,
    showIf: (answers) => answers.hasVehicle === 'yes',
  },
  {
    id: 'insuranceAmount',
    section: 'vehicle',
    titleKey: 'onboarding.questions.insuranceAmount.title',
    subtitleKey: 'onboarding.questions.insuranceAmount.subtitle',
    type: 'currency',
    required: true,
    showIf: (answers) => answers.hasVehicle === 'yes' && answers.vehicleInsurance === true,
  },
  {
    id: 'insuranceDate',
    section: 'vehicle',
    titleKey: 'onboarding.questions.insuranceDate.title',
    subtitleKey: 'onboarding.questions.insuranceDate.subtitle',
    type: 'date',
    required: true,
    showIf: (answers) => answers.hasVehicle === 'yes' && answers.vehicleInsurance === true,
  },
  {
    id: 'roadTax',
    section: 'vehicle',
    titleKey: 'onboarding.questions.roadTax.title',
    subtitleKey: 'onboarding.questions.roadTax.subtitle',
    type: 'yes-no',
    required: true,
    showIf: (answers) => answers.hasVehicle === 'yes',
  },
  {
    id: 'taxAmount',
    section: 'vehicle',
    titleKey: 'onboarding.questions.taxAmount.title',
    subtitleKey: 'onboarding.questions.taxAmount.subtitle',
    type: 'currency',
    required: true,
    showIf: (answers) => answers.hasVehicle === 'yes' && answers.roadTax === true,
  },
  {
    id: 'vehicleMaintenance',
    section: 'vehicle',
    titleKey: 'onboarding.questions.vehicleMaintenance.title',
    subtitleKey: 'onboarding.questions.vehicleMaintenance.subtitle',
    type: 'currency',
    required: true,
    showIf: (answers) => answers.hasVehicle === 'yes',
  },

  // SECTION: Healthcare
  {
    id: 'medicationExpenses',
    section: 'healthcare',
    titleKey: 'onboarding.questions.medicationExpenses.title',
    subtitleKey: 'onboarding.questions.medicationExpenses.subtitle',
    type: 'currency',
    required: true,
  },
  {
    id: 'healthInsurance',
    section: 'healthcare',
    titleKey: 'onboarding.questions.healthInsurance.title',
    subtitleKey: 'onboarding.questions.healthInsurance.subtitle',
    type: 'currency',
    required: true,
  },
  {
    id: 'medicalAppointments',
    section: 'healthcare',
    titleKey: 'onboarding.questions.medicalAppointments.title',
    subtitleKey: 'onboarding.questions.medicalAppointments.subtitle',
    type: 'currency',
    required: true,
  },
  {
    id: 'supportOtherHealthcare',
    section: 'healthcare',
    titleKey: 'onboarding.questions.supportOtherHealthcare.title',
    subtitleKey: 'onboarding.questions.supportOtherHealthcare.subtitle',
    type: 'currency',
    required: true,
  },

  // SECTION: Debt
  {
    id: 'hasDebt',
    section: 'debt',
    titleKey: 'onboarding.questions.hasDebt.title',
    subtitleKey: 'onboarding.questions.hasDebt.subtitle',
    type: 'yes-no',
    required: true,
  },
  {
    id: 'debts',
    section: 'debt',
    titleKey: 'onboarding.questions.debts.title',
    subtitleKey: 'onboarding.questions.debts.subtitle',
    type: 'debts-list',
    required: false,
    showIf: (answers) => answers.hasDebt === true,
  },

  // SECTION: Monthly Bills
  {
    id: 'electricity',
    section: 'bills',
    titleKey: 'onboarding.questions.electricity.title',
    subtitleKey: 'onboarding.questions.electricity.subtitle',
    type: 'currency',
    required: true,
  },
  {
    id: 'water',
    section: 'bills',
    titleKey: 'onboarding.questions.water.title',
    subtitleKey: 'onboarding.questions.water.subtitle',
    type: 'currency',
    required: true,
  },
  {
    id: 'internet',
    section: 'bills',
    titleKey: 'onboarding.questions.internet.title',
    subtitleKey: 'onboarding.questions.internet.subtitle',
    type: 'currency',
    required: true,
  },
  {
    id: 'phone',
    section: 'bills',
    titleKey: 'onboarding.questions.phone.title',
    subtitleKey: 'onboarding.questions.phone.subtitle',
    type: 'currency',
    required: true,
  },
  {
    id: 'subscriptions',
    section: 'bills',
    titleKey: 'onboarding.questions.subscriptions.title',
    subtitleKey: 'onboarding.questions.subscriptions.subtitle',
    type: 'currency',
    required: true,
  },
  {
    id: 'groceries',
    section: 'bills',
    titleKey: 'onboarding.questions.groceries.title',
    subtitleKey: 'onboarding.questions.groceries.subtitle',
    type: 'currency',
    required: true,
  },
  {
    id: 'otherBills',
    section: 'bills',
    titleKey: 'onboarding.questions.otherBills.title',
    subtitleKey: 'onboarding.questions.otherBills.subtitle',
    type: 'currency',
    required: true,
  },

  // SECTION: Annual Bills
  {
    id: 'annualBills',
    section: 'annual',
    titleKey: 'onboarding.questions.annualBills.title',
    subtitleKey: 'onboarding.questions.annualBills.subtitle',
    type: 'yes-no',
    required: true,
  },

  // SECTION: Spending Habits
  {
    id: 'spendingHabits',
    section: 'habits',
    titleKey: 'onboarding.questions.spendingHabits.title',
    subtitleKey: 'onboarding.questions.spendingHabits.subtitle',
    type: 'yes-no',
    required: true,
  },

  // SECTION: Cultural & Religion
  {
    id: 'culturalPref',
    section: 'cultural',
    titleKey: 'onboarding.questions.culturalPref.title',
    subtitleKey: 'onboarding.questions.culturalPref.subtitle',
    type: 'select',
    required: false,
    options: [
      { value: 'muslim', labelKey: 'Muslim' },
      { value: 'christian', labelKey: 'Christian' },
      { value: 'jewish', labelKey: 'Jewish' },
      { value: 'hindu', labelKey: 'Hindu' },
      { value: 'other', labelKey: 'Other' },
      { value: 'none', labelKey: 'Prefer not to say' },
    ],
  },
];

export const getActiveQuestions = (answers: Record<string, any>): QuestionConfig[] => {
  return QUIZ_QUESTIONS.filter((question) => {
    if (question.showIf) {
      return question.showIf(answers);
    }
    return true;
  });
};

export const getResumeQuestionStep = (
  questions: QuestionConfig[],
  answers: Record<string, any>,
  requestedStep: number,
): number => {
  if (questions.length === 0) return 0;

  const firstIncomplete = questions.findIndex((question) => {
    if (!question.required) return false;
    const value = answers[question.id];
    return value === undefined || value === null || value === '';
  });
  const validRequestedStep = Number.isInteger(requestedStep)
    && requestedStep >= 0
    && requestedStep < questions.length;

  if (firstIncomplete >= 0 && (!validRequestedStep || requestedStep > firstIncomplete)) {
    return firstIncomplete;
  }
  return validRequestedStep ? requestedStep : 0;
};

export const EXPENSE_REVIEW_VERSION = 2;

export const hasRequiredMonthlyPlanInputs = (
  answers: Record<string, any>,
  debts: unknown[],
): boolean => {
  const requiredAnswersComplete = getActiveQuestions(answers)
    .filter((question) => question.required)
    .every((question) => {
      const value = answers[question.id];
      return value !== undefined && value !== null && value !== '';
    });

  return requiredAnswersComplete && (answers.hasDebt !== true || debts.length > 0);
};

export const isMonthlyPlanReady = (
  answers: Record<string, any>,
  debts: unknown[],
  onboardingCompleted: boolean,
): boolean => {
  return onboardingCompleted && hasRequiredMonthlyPlanInputs(answers, debts);
};

export const getQuestionSchema = (question: QuestionConfig) => {
  if (!question.required) {
    return z.any().optional();
  }

  switch (question.type) {
    case 'text':
      return z.string().min(1, { message: 'This field is required' });
    case 'number':
      if (['payday', 'firstPayday', 'secondPayday'].includes(question.id)) {
        return z.preprocess(
          (val) => (val === '' || val === undefined ? undefined : Number(val)),
          z.number({ invalid_type_error: 'Must be a number' }).int().min(1, { message: 'Choose a day from 1 to 31' }).max(31, { message: 'Choose a day from 1 to 31' }),
        );
      }
      return z.preprocess(
        (val) => (val === '' || val === undefined ? undefined : Number(val)),
        z.number({ invalid_type_error: 'Must be a number' }).min(0, { message: 'Must be positive' })
      );
    case 'currency':
      return z.preprocess(
        (val) => (val === '' || val === undefined ? undefined : Number(val)),
        z.number({ invalid_type_error: 'Must be a numeric amount' }).min(0, { message: 'Must be positive' })
      );
    case 'yes-no':
      return z.boolean({ required_error: 'Please choose an option' });
    case 'select':
      return z.string().min(1, { message: 'Please choose an option' });
    case 'date':
      return z.string().min(1, { message: 'Please choose a date' });
    default:
      return z.any();
  }
};
