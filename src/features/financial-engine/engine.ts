import {
  safeAdd,
  safeSubtract,
  safeDivide,
  safeSum,
} from '../../utils/currency';
import { DebtInfo } from '../../store/onboardingStore';

export interface AnnualBillInput {
  name: string;
  amount: number;
  monthsRemaining?: number; // If not provided, defaults to 12
}

export interface FinancialProfileInput {
  answers: Record<string, any>;
  debts: DebtInfo[];
  annualBills?: AnnualBillInput[];
}

export interface FinancialProfileOutput {
  totalMonthlyIncome: number;
  essentialMonthlyExpenses: number;
  minimumMonthlyDebtPayments: number;
  monthlyAnnualExpensesPortion: number;
  requiredUpcomingContributions: number;
  realAvailableMonthlyBalance: number;
  safeDailySpending: number;
  savingsCapacity: number;
  debtPressure: 'low' | 'medium' | 'high' | 'critical';
  debtPressureRatio: number;
  budgetDeficit: boolean;
  emergencyFundCapacityMonths: number;
  incomeInstabilityRisk: 'low' | 'medium' | 'high';
  upcomingExpenseRisk: 'low' | 'medium' | 'high';
}

/**
 * Calculate the monthly contribution for an annual bill.
 * Accelrates math if the bill is due soon (monthsRemaining < 12).
 */
export const calculateMonthlyAnnualPortion = (bill: AnnualBillInput): number => {
  const months = bill.monthsRemaining !== undefined && bill.monthsRemaining > 0 
    ? bill.monthsRemaining 
    : 12;
  return safeDivide(bill.amount, months);
};

export const calculateFinancialProfile = (
  input: FinancialProfileInput
): FinancialProfileOutput => {
  const { answers, debts, annualBills = [] } = input;

  // 1. Income Calculations
  const mainIncome = Number(answers.mainIncome || 0);
  const secondIncome = Number(answers.secondIncome || 0);
  const totalMonthlyIncome = safeAdd(mainIncome, secondIncome);

  // 2. Essential Monthly Expenses
  const housing = Number(answers.housingAmount || 0);
  const electricity = Number(answers.electricity || 0);
  const water = Number(answers.water || 0);
  const internet = Number(answers.internet || 0);
  const phone = Number(answers.phone || 0);
  const groceries = Number(answers.groceries || 0);
  const medication = Number(answers.medicationExpenses || 0);
  const healthInsurance = Number(answers.healthInsurance || 0);
  const medicalAppointments = Number(answers.medicalAppointments || 0);
  const healthcareSupport = Number(answers.supportOtherHealthcare || 0);
  
  // Family essential expenses
  const schoolFees = Number(answers.schoolFees || 0);
  const childcare = Number(answers.childcareExpenses || 0);
  
  // Vehicle essential expenses (loan is separate in minimum debts, fuel/maintenance are regular essential)
  const hasVehicle = answers.hasVehicle === 'yes';
  const fuel = hasVehicle ? Number(answers.fuelSpending || 0) : 0;
  const vehicleMaintenance = hasVehicle ? Number(answers.vehicleMaintenance || 0) : 0;

  // Sum raw essential expenses (excluding debts/annuals)
  const essentialMonthlyExpenses = safeSum([
    housing,
    electricity,
    water,
    internet,
    phone,
    groceries,
    medication,
    healthInsurance,
    medicalAppointments,
    healthcareSupport,
    schoolFees,
    childcare,
    fuel,
    vehicleMaintenance,
  ]);

  // 3. Minimum Monthly Debt Payments
  // Include vehicle financing loans if answers indicate vehicle loan
  const vehicleLoanPayment = hasVehicle && answers.vehicleFinancing === true
    ? Number(answers.vehiclePayment || 0)
    : 0;

  const standardDebtsMinimum = debts.reduce((sum, d) => safeAdd(sum, d.minimumPayment), 0);
  const minimumMonthlyDebtPayments = safeAdd(standardDebtsMinimum, vehicleLoanPayment);

  // 4. Monthly portions of annual expenses
  let monthlyAnnualExpensesPortion = 0;
  
  // Map onboarding annual vehicle insurance & tax inputs if they exist
  const mappedAnnualBills = [...annualBills];
  if (hasVehicle && answers.vehicleInsurance === true && answers.insuranceAmount) {
    // Calculate months remaining based on date or default to 12
    const insAmt = Number(answers.insuranceAmount);
    let monthsRemaining = 12;
    if (answers.insuranceDate) {
      const dueDate = new Date(answers.insuranceDate);
      const today = new Date();
      const diffMs = dueDate.getTime() - today.getTime();
      const diffMonths = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30));
      monthsRemaining = diffMonths > 0 && diffMonths <= 12 ? diffMonths : 12;
    }
    mappedAnnualBills.push({
      name: 'Vehicle Insurance',
      amount: insAmt,
      monthsRemaining,
    });
  }

  if (hasVehicle && answers.roadTax === true && answers.taxAmount) {
    mappedAnnualBills.push({
      name: 'Road Tax',
      amount: Number(answers.taxAmount),
      monthsRemaining: 12,
    });
  }

  monthlyAnnualExpensesPortion = mappedAnnualBills.reduce(
    (sum, bill) => safeAdd(sum, calculateMonthlyAnnualPortion(bill)),
    0
  );

  // 5. Required Upcoming Event contributions (Cultural events, holidays)
  // Mock contribution: e.g. Muslim users preparing for Ramadan / Eid
  let requiredUpcomingContributions = 0;
  if (answers.culturalPref === 'muslim') {
    // Standard mock preparation cost for Eid/Ramadan: MAD 1200 / year -> MAD 100 / month
    requiredUpcomingContributions = 100;
  }

  // 6. Real Available Monthly Balance
  // Balance = Income - Essentials - Debt Min - Annual Portion - Event Contributions
  const essentialTotalCosts = safeSum([
    essentialMonthlyExpenses,
    minimumMonthlyDebtPayments,
    monthlyAnnualExpensesPortion,
    requiredUpcomingContributions,
  ]);
  
  const realAvailableMonthlyBalance = safeSubtract(totalMonthlyIncome, essentialTotalCosts);

  // 7. safe daily spending
  // Derived from remaining available balance (over 30 days)
  const safeDailySpending = realAvailableMonthlyBalance > 0
    ? safeDivide(realAvailableMonthlyBalance, 30)
    : 0;

  // 8. savings capacity
  const savingsCapacity = realAvailableMonthlyBalance > 0 ? realAvailableMonthlyBalance : 0;

  // 9. debt pressure
  const totalOutflowsForDebt = minimumMonthlyDebtPayments;
  const debtPressureRatio = totalMonthlyIncome > 0
    ? safeDivide(totalOutflowsForDebt, totalMonthlyIncome)
    : 0;

  let debtPressure: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (debtPressureRatio > 0.4) {
    debtPressure = 'critical';
  } else if (debtPressureRatio > 0.2) {
    debtPressure = 'high';
  } else if (debtPressureRatio > 0.1) {
    debtPressure = 'medium';
  }

  // 10. budget deficit detection
  // Deficit occurs when total essential costs (including minimum debt) exceed total income
  const budgetDeficit = totalMonthlyIncome < safeAdd(essentialMonthlyExpenses, minimumMonthlyDebtPayments);

  // 11. emergency-fund capacity
  // Expressed as: how many months of essential expenses does their current available savings capacity support
  // Let's compute based on: if they save their savingsCapacity, how long to build 3 months of essentials
  const monthlyEssentials = safeAdd(essentialMonthlyExpenses, minimumMonthlyDebtPayments);
  const emergencyFundCapacityMonths = monthlyEssentials > 0
    ? safeDivide(totalMonthlyIncome, monthlyEssentials) // basic safety ratio (income to essential)
    : 0;

  // 12. income instability risk
  let incomeInstabilityRisk: 'low' | 'medium' | 'high' = 'low';
  if (answers.incomeType === 'irregular' || answers.employmentStatus === 'unemployed') {
    incomeInstabilityRisk = 'high';
  } else if (answers.employmentStatus === 'self-employed') {
    incomeInstabilityRisk = 'medium';
  }

  // 13. upcoming expense risk
  // High if they have multiple upcoming events/annual portions but low available balance
  let upcomingExpenseRisk: 'low' | 'medium' | 'high' = 'low';
  if (monthlyAnnualExpensesPortion + requiredUpcomingContributions > 0) {
    if (realAvailableMonthlyBalance < 200) {
      upcomingExpenseRisk = 'high';
    } else if (realAvailableMonthlyBalance < 1000) {
      upcomingExpenseRisk = 'medium';
    }
  }

  return {
    totalMonthlyIncome,
    essentialMonthlyExpenses,
    minimumMonthlyDebtPayments,
    monthlyAnnualExpensesPortion,
    requiredUpcomingContributions,
    realAvailableMonthlyBalance,
    safeDailySpending,
    savingsCapacity,
    debtPressure,
    debtPressureRatio,
    budgetDeficit,
    emergencyFundCapacityMonths,
    incomeInstabilityRisk,
    upcomingExpenseRisk,
  };
};
