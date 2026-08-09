import { getCurrencyFractionDigits } from './currency';

export const MAX_FINANCIAL_AMOUNT = 1_000_000_000_000;

export const parseFinancialAmount = (value: string | number, currency = 'MAD') => {
  const normalized = typeof value === 'string' ? value.trim().replace(',', '.') : value;
  if (normalized === '' || typeof normalized === 'string' && !/^\d+(?:\.\d+)?$/.test(normalized)) return null;
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0 || amount > MAX_FINANCIAL_AMOUNT) return null;
  const decimals = typeof normalized === 'string' ? normalized.split('.')[1]?.length || 0 : 0;
  if (decimals > getCurrencyFractionDigits(currency)) return null;
  return amount;
};

export const isValidIsoDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export const isFutureDate = (value: string, today = new Date()) => {
  if (!isValidIsoDate(value)) return false;
  const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return new Date(`${value}T00:00:00`) >= localToday;
};

export const isValidDebt = (debt: {
  totalAmount: number;
  minimumPayment: number;
  interestRate: number;
  dueDate: string;
}) => Number.isFinite(debt.totalAmount)
  && debt.totalAmount > 0
  && Number.isFinite(debt.minimumPayment)
  && debt.minimumPayment >= 0
  && debt.minimumPayment <= debt.totalAmount
  && Number.isFinite(debt.interestRate)
  && debt.interestRate >= 0
  && debt.interestRate <= 100
  && /^(?:[1-9]|[12]\d|3[01])$/.test(debt.dueDate);
