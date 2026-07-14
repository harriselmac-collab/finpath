import { safeSubtract, safeDivide } from '../../utils/currency';
import { DebtInfo } from '../../store/onboardingStore';
export interface GoalInput {
  name: string;
  targetAmount: number;
  alreadySaved: number;
  targetDate: string; // YYYY-MM-DD
  isEssential: boolean;
  classification?: 'essential' | 'important' | 'optional';
}

export interface GoalCalculationsOutput {
  remainingAmount: number;
  monthsRemaining: number;
  requiredMonthlyContribution: number;
  isRealistic: boolean;
  explanation: string | null;
  suggestions: {
    recommendedExtendMonths: number;
    recommendedTargetAmount: number;
    text: string;
  }[];
}

/**
 * Calculate months remaining between today and target date.
 * Returns at least 1 month to avoid division by zero.
 */
export const calculateMonthsRemaining = (targetDateStr: string): number => {
  const target = new Date(targetDateStr);
  const today = new Date();
  
  if (isNaN(target.getTime())) return 12; // Fallback to 1 year if date is invalid

  const yearsDiff = target.getFullYear() - today.getFullYear();
  const monthsDiff = target.getMonth() - today.getMonth() + (yearsDiff * 12);

  return monthsDiff > 0 ? monthsDiff : 1;
};

/**
 * Perform feasibility analysis on a personal goal.
 */
export const analyzeGoalFeasibility = (
  goal: GoalInput,
  availableMonthlyBalance: number
): GoalCalculationsOutput => {
  const { targetAmount, alreadySaved, targetDate } = goal;

  const remainingAmount = safeSubtract(targetAmount, alreadySaved);
  const monthsRemaining = calculateMonthsRemaining(targetDate);

  const requiredMonthlyContribution = remainingAmount > 0 
    ? safeDivide(remainingAmount, monthsRemaining) 
    : 0;

  // Feasibility Check
  const isRealistic = requiredMonthlyContribution <= availableMonthlyBalance;

  let explanation: string | null = null;
  const suggestions: GoalCalculationsOutput['suggestions'] = [];

  if (!isRealistic) {
    explanation = `Saving ${requiredMonthlyContribution.toFixed(2)} monthly for your goal "${goal.name}" is unrealistic. It exceeds your available monthly balance of ${availableMonthlyBalance.toFixed(2)}.`;

    // Suggestion 1: Extend the deadline
    // Calculate months needed at 80% of available monthly balance to leave a safety buffer
    const safeMonthlyAlloc = safeSubtract(availableMonthlyBalance, 100) > 0 
      ? safeSubtract(availableMonthlyBalance, 100) 
      : safeDivide(availableMonthlyBalance, 2);

    const recommendedExtendMonths = safeMonthlyAlloc > 0
      ? Math.ceil(remainingAmount / safeMonthlyAlloc)
      : monthsRemaining * 3; // Fallback factor if balance is zero or negative

    suggestions.push({
      recommendedExtendMonths,
      recommendedTargetAmount: targetAmount,
      text: `Extend the deadline: Saving for ${recommendedExtendMonths} months instead of ${monthsRemaining} months at an affordable contribution of ${safeMonthlyAlloc.toFixed(2)} monthly.`,
    });

    // Suggestion 2: Reduce the target amount
    // What target is affordable under the current timeline?
    const maxAffordableRemaining = safeDivide(availableMonthlyBalance, 1) * monthsRemaining;
    const recommendedTargetAmount = maxAffordableRemaining + alreadySaved;

    suggestions.push({
      recommendedExtendMonths: monthsRemaining,
      recommendedTargetAmount,
      text: `Reduce target amount: Lower your savings target to ${recommendedTargetAmount.toFixed(2)} to keep your current deadline.`,
    });

    // Suggestion 3: General counseling suggestions
    suggestions.push({
      recommendedExtendMonths: monthsRemaining,
      recommendedTargetAmount: targetAmount,
      text: 'Pause other goals: Consider pausing optional savings targets to direct all available funds to this priority.',
    });
  }

  return {
    remainingAmount,
    monthsRemaining,
    requiredMonthlyContribution,
    isRealistic,
    explanation,
    suggestions,
  };
};

export interface AmortizationResult {
  timeline: number[];
  clearedIn: string;
}

export const calculateAmortizationSchedule = (
  debts: DebtInfo[],
  availableSurplus: number,
  method: 'snowball' | 'avalanche'
): AmortizationResult => {
  const list = debts.map((d, index) => ({
    id: index.toString(),
    type: d.type,
    balance: d.totalAmount,
    minPay: d.minimumPayment,
    rate: d.interestRate,
  }));

  const monthlyData: number[] = [list.reduce((sum, d) => sum + d.balance, 0)];
  let months = 0;
  const maxMonths = 24; // Capped for drawing limits

  while (months < maxMonths) {
    const totalOutstanding = list.reduce((sum, d) => sum + d.balance, 0);
    if (totalOutstanding <= 0) break;

    // 1. Calculate base payments (must pay minimum on all active debts)
    const payments = list.map((d) => {
      if (d.balance <= 0) return { id: d.id, amount: 0 };
      const pay = Math.min(d.balance, d.minPay);
      return { id: d.id, amount: pay };
    });

    // 2. Determine extra cash flow available (surplus - sum of minimums)
    const sumMinimums = list.reduce((sum, d) => sum + (d.balance > 0 ? d.minPay : 0), 0);
    let extraCash = Math.max(0, availableSurplus - sumMinimums);

    // 3. Sort remaining active accounts based on chosen algorithm
    const targetList = [...list].filter((d) => d.balance > 0);
    if (method === 'snowball') {
      targetList.sort((a, b) => a.balance - b.balance);
    } else {
      targetList.sort((a, b) => b.rate - a.rate);
    }

    // 4. Distribute extra cash
    if (targetList.length > 0 && extraCash > 0) {
      const primaryTarget = list.find((d) => d.id === targetList[0].id);
      if (primaryTarget) {
        const currentPay = payments.find((p) => p.id === primaryTarget.id);
        const spaceRemaining = primaryTarget.balance - (currentPay?.amount || 0);
        const additional = Math.min(spaceRemaining, extraCash);
        if (currentPay) {
          currentPay.amount += additional;
        }
        extraCash -= additional;
      }
    }

    // 5. Apply payments and compound interest
    list.forEach((d) => {
      if (d.balance <= 0) return;
      const paid = payments.find((p) => p.id === d.id)?.amount || 0;
      let bal = d.balance - paid;
      if (bal > 0) {
        const monthlyRate = d.rate / 100 / 12;
        bal = bal + bal * monthlyRate;
      }
      d.balance = Math.max(0, bal);
    });

    monthlyData.push(list.reduce((sum, d) => sum + d.balance, 0));
    months++;
  }

  return {
    timeline: monthlyData,
    clearedIn: months >= maxMonths ? '24+ months' : `${months} months`,
  };
};
