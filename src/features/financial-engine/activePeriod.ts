import { safeDivide, safeSubtract, safeSum } from '../../utils/currency';

export type FinancialTransactionType = 'income' | 'essential' | 'flexible' | 'debt' | 'savings' | 'refund' | 'transfer';

export interface PeriodTransaction {
  id: string;
  amount: number;
  type: FinancialTransactionType;
  timestamp: number;
}

export interface PeriodCommitment {
  id: string;
  amount: number;
  dueDate: string;
  paid: boolean;
}

export interface ActiveFinancialPeriodInput {
  periodStart: string;
  nextIncomeDate: string;
  currentAvailableBalance?: number;
  plannedIncome: number;
  plannedEssential: number;
  plannedFlexible: number;
  plannedDebt: number;
  protectedBuffer?: number;
  currency?: string;
  transactions: PeriodTransaction[];
  commitments?: PeriodCommitment[];
  now?: Date;
}

export interface ActiveFinancialPeriodResult {
  plannedIncome: number;
  confirmedIncome: number;
  currentAvailableBalance: number;
  actualEssential: number;
  actualFlexible: number;
  actualDebt: number;
  actualSavings: number;
  remainingEssentialCommitments: number;
  remainingDebtCommitments: number;
  remainingUpcomingCommitments: number;
  protectedBuffer: number;
  safeToSpendTotal: number;
  safeDailySpending: number;
  projectedBalanceBeforeNextIncome: number;
  shortfallAmount: number;
  plannedSpending: number;
  actualSpending: number;
  plannedVsActualVariance: number;
  categoryOverspending: {
    essential: boolean;
    flexible: boolean;
    debt: boolean;
  };
  remainingDays: number;
  calculatedAt: string;
}

const startOfUtcDay = (value: string | Date) => {
  const date = typeof value === 'string' ? new Date(`${value}T00:00:00Z`) : value;
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

export const calculateRemainingDays = (now: Date, nextIncomeDate: string) =>
  Math.max(1, Math.ceil((startOfUtcDay(nextIncomeDate) - startOfUtcDay(now)) / 86_400_000));

export const calculateActiveFinancialPeriod = (
  input: ActiveFinancialPeriodInput,
): ActiveFinancialPeriodResult => {
  const currency = input.currency || 'MAD';
  const now = input.now || new Date();
  const periodStart = startOfUtcDay(input.periodStart);
  const periodEnd = startOfUtcDay(input.nextIncomeDate) + 86_399_999;
  const transactions = input.transactions.filter(({ timestamp }) => timestamp >= periodStart && timestamp <= periodEnd);
  const sumType = (type: FinancialTransactionType) => safeSum(
    transactions.filter((transaction) => transaction.type === type).map(({ amount }) => amount),
    currency,
  );

  const confirmedIncome = sumType('income');
  const actualEssential = sumType('essential');
  const actualFlexible = safeSubtract(sumType('flexible'), sumType('refund'), currency);
  const actualDebt = sumType('debt');
  const actualSavings = sumType('savings');
  const actualSpending = safeSum([actualEssential, actualFlexible, actualDebt, actualSavings], currency);
  const openingBalance = input.currentAvailableBalance ?? input.plannedIncome;
  const currentAvailableBalance = safeSubtract(
    safeSum([openingBalance, confirmedIncome], currency),
    actualSpending,
    currency,
  );
  const remainingEssentialCommitments = Math.max(
    0,
    safeSubtract(input.plannedEssential, actualEssential, currency),
  );
  const remainingDebtCommitments = Math.max(0, safeSubtract(input.plannedDebt, actualDebt, currency));
  const remainingUpcomingCommitments = safeSum(
    (input.commitments || [])
      .filter(({ paid, dueDate }) => !paid && startOfUtcDay(dueDate) <= periodEnd)
      .map(({ amount }) => amount),
    currency,
  );
  const protectedBuffer = Math.max(0, input.protectedBuffer || 0);
  const projectedBalanceBeforeNextIncome = safeSubtract(
    currentAvailableBalance,
    safeSum([remainingEssentialCommitments, remainingDebtCommitments, remainingUpcomingCommitments], currency),
    currency,
  );
  const safeToSpendTotal = safeSubtract(projectedBalanceBeforeNextIncome, protectedBuffer, currency);
  const remainingDays = calculateRemainingDays(now, input.nextIncomeDate);
  const plannedSpending = safeSum([
    input.plannedEssential,
    input.plannedFlexible,
    input.plannedDebt,
    remainingUpcomingCommitments,
  ], currency);

  return {
    plannedIncome: input.plannedIncome,
    confirmedIncome,
    currentAvailableBalance,
    actualEssential,
    actualFlexible,
    actualDebt,
    actualSavings,
    remainingEssentialCommitments,
    remainingDebtCommitments,
    remainingUpcomingCommitments,
    protectedBuffer,
    safeToSpendTotal,
    safeDailySpending: safeDivide(safeToSpendTotal, remainingDays, currency),
    projectedBalanceBeforeNextIncome,
    shortfallAmount: safeToSpendTotal < 0 ? Math.abs(safeToSpendTotal) : 0,
    plannedSpending,
    actualSpending,
    plannedVsActualVariance: safeSubtract(plannedSpending, actualSpending, currency),
    categoryOverspending: {
      essential: actualEssential > input.plannedEssential,
      flexible: actualFlexible > input.plannedFlexible,
      debt: actualDebt > input.plannedDebt,
    },
    remainingDays,
    calculatedAt: now.toISOString(),
  };
};
