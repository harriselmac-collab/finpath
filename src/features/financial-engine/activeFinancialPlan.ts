import type { Bill } from '../../store/billsStore';
import type { DebtInfo } from '../../store/onboardingStore';
import { calculateActiveFinancialPeriod, type PeriodTransaction } from './activePeriod';
import { calculateFinancialProfile } from './engine';
import { resolveIncomeTiming } from '../onboarding/incomeSchedule';

interface ActiveFinancialPlanInput {
  answers: Record<string, any>;
  debts: DebtInfo[];
  transactions?: PeriodTransaction[];
  bills?: Pick<Bill, 'id' | 'amount' | 'nextDueDate' | 'paid' | 'isActive'>[];
  now?: Date;
}

export const calculateActiveFinancialPlan = ({
  answers,
  debts,
  transactions = [],
  bills = [],
  now = new Date(),
}: ActiveFinancialPlanInput) => {
  const currency = answers.currency || 'MAD';
  const profile = calculateFinancialProfile({ answers, debts });
  const incomeTiming = resolveIncomeTiming(answers, now);
  const additionalCommitments = profile.monthlyAnnualExpensesPortion
    + profile.requiredUpcomingContributions;
  const plannedCommitments = additionalCommitments + Number(answers.annualExpenseDue || 0);

  const activePeriod = calculateActiveFinancialPeriod({
    periodStart: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10),
    nextIncomeDate: incomeTiming.calculationDate,
    currentAvailableBalance: Number(answers.availableBalance ?? 0),
    plannedIncome: profile.totalMonthlyIncome,
    plannedEssential: Number(answers.essentialBillsDue ?? profile.essentialMonthlyExpenses),
    plannedFlexible: Number(answers.upcomingFlexibleSpending ?? profile.flexibleMonthlyExpenses),
    plannedDebt: Number(answers.debtMinimumDue ?? profile.minimumMonthlyDebtPayments),
    protectedBuffer: Number(answers.protectedBuffer || 0) + Number(answers.savingsGoalAmount || 0),
    currency,
    transactions,
    commitments: [
      ...(plannedCommitments > 0
        ? [{ id: 'planned-commitments', amount: plannedCommitments, dueDate: incomeTiming.calculationDate, paid: false }]
        : []),
      ...bills.filter((bill) => bill.isActive).map((bill) => ({
        id: bill.id,
        amount: bill.amount,
        dueDate: bill.nextDueDate,
        paid: bill.paid,
      })),
    ],
    now,
  });

  return { profile, incomeTiming, activePeriod, additionalCommitments };
};
