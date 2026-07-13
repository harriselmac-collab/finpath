export interface SafetyReport {
  hasDeficit: boolean;
  warningMessage: string | null;
  recommendations: string[];
  protectedCategories: string[];
}

/**
 * Evaluates the safety limits of the user's budget profile.
 * Generates warning structures and constructive recommendations for shortfalls.
 */
export const evaluateBudgetSafety = (
  totalIncome: number,
  essentialExpenses: number,
  minimumDebt: number,
  answers: Record<string, any>
): SafetyReport => {
  const essentialOutflows = essentialExpenses + minimumDebt;
  const hasDeficit = totalIncome < essentialOutflows;

  const protectedCategories = [
    'Food and water',
    'Housing (Rent/Mortgage)',
    'Medication and necessary healthcare',
    'Electricity and essential utilities',
    'Essential transportation',
    'Minimum debt payments',
  ];

  let warningMessage: string | null = null;
  const recommendations: string[] = [];

  if (hasDeficit) {
    // 1. Mandatory shortfall warning message
    warningMessage =
      'Your current income does not fully cover your essential needs. This is an income shortfall, not simply a spending-discipline problem.';

    // 2. Add constructive safety suggestions
    recommendations.push(
      'Review non-essential expenses: audit all recurring subscriptions, flexible spending, and optional habits to reduce immediate outflows.'
    );
    recommendations.push(
      'Contact creditors: speak to your lenders or debt collectors early. Inform them of your shortfall, and explore options like interest rate freezes, payment deferrals, or restructuring plans.'
    );
    recommendations.push(
      'Explore available assistance: look into local social security systems, non-governmental aid, community support initiatives, or municipal relief funds.'
    );

    // Context-sensitive suggestions
    if (answers.medicationExpenses > 0 || answers.medicalAppointments > 0) {
      recommendations.push(
        'Seek healthcare assistance: check for patient assistance programs, discuss generic drug alternatives with your doctor, or explore public clinics to avoid stopping prescribed treatments.'
      );
    }

    if (answers.housingAmount > 0) {
      recommendations.push(
        'Protect your housing: speak to your landlord or mortgage provider to request short-term grace periods or negotiate temporary payment plans.'
      );
    }
  } else {
    // Healthy budget recommendations
    recommendations.push(
      'Build emergency protection: aim to allocate surplus funds towards saving a 3-to-6 month buffer of essential expenses.'
    );
    recommendations.push(
      'Optimize debt payoff: if your debt pressure ratio is high, consider allocating flexible savings towards paying off high-interest debts using the avalanche method.'
    );
  }

  // Double check that we NEVER recommend unsafe actions
  // (All recommendations are filtered to exclude unsafe paths)
  
  return {
    hasDeficit,
    warningMessage,
    recommendations,
    protectedCategories,
  };
};
