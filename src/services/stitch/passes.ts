import { StitchPassClass, StitchPassObject, StitchPassType } from './types';
import { formatCurrency } from '../../utils/currency';

export interface PassClassDefinition {
  type: StitchPassType;
  classId: string;
  issuerId: string;
  title: string;
  description: string;
  heroImageUri?: string;
}

export interface PassObjectDefinition {
  type: StitchPassType;
  objectId: string;
  classId: string;
  issuerId: string;
  title: string;
  subtitle: string;
  details: { label: string; value: string }[];
  barcodeValue?: string;
  heroImageUri?: string;
}

export function buildSavingsGoalClass(issuerId: string): PassClassDefinition {
  return {
    type: 'savingsGoal',
    classId: 'savings_goal_v1',
    issuerId,
    title: 'Pocket Ahead Savings Goal',
    description: 'Track your personal savings goal progress',
  };
}

export function buildSavingsGoalObject(
  issuerId: string,
  goalName: string,
  targetAmount: number,
  alreadySaved: number,
  monthsRemaining: number,
  currencySymbol: string = 'MAD'
): PassObjectDefinition {
  const progress = targetAmount > 0 ? Math.round((alreadySaved / targetAmount) * 100) : 0;
  const remaining = targetAmount - alreadySaved;

  return {
    type: 'savingsGoal',
    objectId: `savings_goal_${Date.now()}`,
    classId: 'savings_goal_v1',
    issuerId,
    title: goalName,
    subtitle: `${progress}% saved · ${monthsRemaining} months left`,
    details: [
      { label: 'Target', value: formatCurrency(targetAmount, currencySymbol) },
      { label: 'Saved', value: formatCurrency(alreadySaved, currencySymbol) },
      { label: 'Remaining', value: formatCurrency(remaining, currencySymbol) },
      { label: 'Timeline', value: `${monthsRemaining} months` },
    ],
    barcodeValue: `FINPATH-SG-${goalName.replace(/\s+/g, '-').toUpperCase()}-${Date.now()}`,
  };
}

export function buildDebtMilestoneClass(issuerId: string): PassClassDefinition {
  return {
    type: 'debtMilestone',
    classId: 'debt_milestone_v1',
    issuerId,
    title: 'Pocket Ahead Debt Milestone',
    description: 'Track your debt payoff progress',
  };
}

export function buildDebtMilestoneObject(
  issuerId: string,
  debtType: string,
  totalDebt: number,
  currentBalance: number,
  minimumPayment: number,
  currencySymbol: string = 'MAD'
): PassObjectDefinition {
  const progress = totalDebt > 0 ? Math.round(((totalDebt - currentBalance) / totalDebt) * 100) : 0;

  return {
    type: 'debtMilestone',
    objectId: `debt_milestone_${Date.now()}`,
    classId: 'debt_milestone_v1',
    issuerId,
    title: debtType,
    subtitle: `${progress}% paid off`,
    details: [
      { label: 'Original Amount', value: formatCurrency(totalDebt, currencySymbol) },
      { label: 'Current Balance', value: formatCurrency(currentBalance, currencySymbol) },
      { label: 'Min Payment', value: formatCurrency(minimumPayment, currencySymbol) },
      { label: 'Progress', value: `${progress}%` },
    ],
    barcodeValue: `FINPATH-DM-${debtType.replace(/\s+/g, '-').toUpperCase()}-${Date.now()}`,
  };
}

export function buildEmergencyFundClass(issuerId: string): PassClassDefinition {
  return {
    type: 'emergencyFund',
    classId: 'emergency_fund_v1',
    issuerId,
    title: 'Pocket Ahead Emergency Fund',
    description: 'Your emergency protection buffer status',
  };
}

export function buildEmergencyFundObject(
  issuerId: string,
  targetAmount: number,
  currentAmount: number,
  monthsCovered: number,
  currencySymbol: string = 'MAD'
): PassObjectDefinition {
  const progress = targetAmount > 0 ? Math.round((currentAmount / targetAmount) * 100) : 0;

  return {
    type: 'emergencyFund',
    objectId: `emergency_fund_${Date.now()}`,
    classId: 'emergency_fund_v1',
    issuerId,
    title: 'Emergency Protection Fund',
    subtitle: `${monthsCovered} months covered · ${progress}% complete`,
    details: [
      { label: 'Target', value: formatCurrency(targetAmount, currencySymbol) },
      { label: 'Current', value: formatCurrency(currentAmount, currencySymbol) },
      { label: 'Coverage', value: `${monthsCovered} months` },
      { label: 'Progress', value: `${progress}%` },
    ],
    barcodeValue: `FINPATH-EF-${Date.now()}`,
  };
}

export function classToStitchFormat(def: PassClassDefinition): StitchPassClass {
  return {
    id: `${def.issuerId}.${def.classId}`,
    issuerId: def.issuerId,
    type: def.type,
  };
}

export function objectToStitchFormat(def: PassObjectDefinition): StitchPassObject {
  return {
    id: `${def.issuerId}.${def.objectId}`,
    classId: `${def.issuerId}.${def.classId}`,
    type: def.type,
    state: 'ACTIVE',
    barcode: def.barcodeValue
      ? {
          type: 'QR_CODE',
          value: def.barcodeValue,
        }
      : undefined,
    textModulesData: def.details.map((d) => ({
      header: d.label,
      body: d.value,
    })),
  };
}
